import * as core from '@actions/core';
import { getOctokit } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import { IssueContext, BranchCreationResult, SanitizationConfig } from '../types';
import { sanitizeBranchName } from '../utils/sanitizer';

/**
 * Manages GitHub branch creation via the GitHub API.
 */
export class BranchManager {
  private octokit: InstanceType<typeof GitHub>;
  private owner: string;
  private repo: string;

  /**
   * Creates a new BranchManager instance.
   *
   * @param token - GitHub token used for authentication
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param apiUrl - Base URL of the GitHub API (for GitHub Enterprise)
   */
  constructor(token: string, owner: string, repo: string, apiUrl?: string) {
    this.octokit = getOctokit(token, { baseUrl: apiUrl });
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Creates a new branch from an issue context.
   *
   * @param issueContext - Context information from the issue
   * @param config - Sanitization configuration for branch name
   * @param baseBranch - Base branch to create the new branch from
   * @param addComment - Whether to add a comment to the issue with the branch name
   * @returns Branch creation result with branch name and metadata
   */
  async createBranch(
    issueContext: IssueContext,
    config: SanitizationConfig,
    baseBranch: string,
    addComment: boolean
  ): Promise<BranchCreationResult> {
    core.info(`Creating branch for issue #${issueContext.number}: "${issueContext.title}"`);

    const sanitizedName = sanitizeBranchName(issueContext.title, config);
    core.debug(`Sanitized branch name: "${sanitizedName}"`);

    let finalBranchName = sanitizedName;
    let wasDuplicate = false;

    if (await this.branchExists(sanitizedName)) {
      core.warning(`Branch "${sanitizedName}" already exists. Handling duplicate...`);
      finalBranchName = await this.handleDuplicateBranch(sanitizedName);
      wasDuplicate = true;
    }

    const commitSha = await this.getBaseBranchSha(baseBranch);
    core.debug(`Base branch "${baseBranch}" SHA: ${commitSha}`);

    try {
      await this.octokit.rest.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${finalBranchName}`,
        sha: commitSha
      });

      core.info(`Branch "${finalBranchName}" created successfully.`);
    } catch (error) {
      throw new Error(`Failed to create branch "${finalBranchName}": ${(error as Error).message}`);
    }

    if (addComment) {
      await this.addCommentToIssue(issueContext.number, finalBranchName);
    }

    return {
      branchName: finalBranchName,
      originalName: sanitizedName,
      wasDuplicate,
      commitSha
    };
  }

  /**
   * Checks if a branch exists in the repository.
   *
   * @param branchName - Name of the branch to check
   * @returns True if the branch exists, false otherwise
   */
  async branchExists(branchName: string): Promise<boolean> {
    core.debug(`Checking if branch "${branchName}" exists...`);

    try {
      await this.octokit.rest.repos.getBranch({
        owner: this.owner,
        repo: this.repo,
        branch: branchName
      });

      core.debug(`Branch "${branchName}" exists.`);
      return true;
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        core.debug(`Branch "${branchName}" does not exist.`);
        return false;
      }

      throw new Error(`Failed to check if branch "${branchName}" exists: ${(error as Error).message}`);
    }
  }

  /**
   * Handles duplicate branch names by appending a numeric suffix.
   *
   * @param baseName - Base branch name that already exists
   * @returns New branch name with numeric suffix that doesn't exist
   */
  async handleDuplicateBranch(baseName: string): Promise<string> {
    let suffix = 1;
    let newBranchName = `${baseName}-${suffix}`;

    while (await this.branchExists(newBranchName)) {
      suffix++;
      newBranchName = `${baseName}-${suffix}`;
      core.debug(`Trying branch name: "${newBranchName}"`);
    }

    core.info(`Using branch name "${newBranchName}" to avoid duplicate.`);
    return newBranchName;
  }

  /**
   * Gets the SHA of the latest commit on a branch.
   *
   * @param branchName - Name of the branch
   * @returns SHA of the latest commit
   */
  private async getBaseBranchSha(branchName: string): Promise<string> {
    core.debug(`Fetching SHA for base branch "${branchName}"...`);

    try {
      const { data } = await this.octokit.rest.repos.getBranch({
        owner: this.owner,
        repo: this.repo,
        branch: branchName
      });

      return data.commit.sha;
    } catch (error) {
      throw new Error(`Failed to get SHA for base branch "${branchName}": ${(error as Error).message}`);
    }
  }

  /**
   * Adds a comment to an issue with the created branch name.
   *
   * @param issueNumber - Issue number to comment on
   * @param branchName - Name of the created branch
   */
  async addCommentToIssue(issueNumber: number, branchName: string): Promise<void> {
    core.info(`Adding comment to issue #${issueNumber} with branch name "${branchName}".`);

    const commentBody = `Branch \`${branchName}\` has been created for this issue. 🚀`;

    try {
      await this.octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body: commentBody
      });

      core.info(`Comment added to issue #${issueNumber} successfully.`);
    } catch (error) {
      throw new Error(`Failed to add comment to issue #${issueNumber}: ${(error as Error).message}`);
    }
  }
}

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
   * @param linkToIssue - Whether to link the branch to the issue using GraphQL
<<<<<<< HEAD
   * @param autoAssign - Whether to automatically assign the issue author as assignee
=======
>>>>>>> origin/main
   * @returns Branch creation result with branch name and metadata
   */
  async createBranch(
    issueContext: IssueContext,
    config: SanitizationConfig,
    baseBranch: string,
    addComment: boolean,
<<<<<<< HEAD
    linkToIssue: boolean = true,
    autoAssign: boolean = false
=======
    linkToIssue: boolean = true
>>>>>>> origin/main
  ): Promise<BranchCreationResult> {
    core.info(`Creating branch for issue #${issueContext.number}: "${issueContext.title}"`);

    const sanitizedName = sanitizeBranchName(issueContext.title, config);
    core.debug(`Sanitized branch name: "${sanitizedName}"`);

    let finalBranchName = sanitizedName;
    let wasDuplicate = false;
    let linkedToIssue = false;

    if (await this.branchExists(sanitizedName)) {
      core.warning(`Branch "${sanitizedName}" already exists. Handling duplicate...`);
      finalBranchName = await this.handleDuplicateBranch(sanitizedName);
      wasDuplicate = true;
    }

    const commitSha = await this.getBaseBranchSha(baseBranch);
    core.debug(`Base branch "${baseBranch}" SHA: ${commitSha}`);

    if (linkToIssue && issueContext.nodeId) {
      try {
        linkedToIssue = await this.createLinkedBranchViaGraphQL(issueContext.nodeId, finalBranchName, commitSha);
        core.info(`Branch "${finalBranchName}" created and linked to issue successfully.`);
      } catch (error) {
        core.warning(
          `Failed to create linked branch via GraphQL: ${(error as Error).message}. Falling back to REST API.`
        );
        await this.createBranchViaREST(finalBranchName, commitSha);
      }
    } else {
      await this.createBranchViaREST(finalBranchName, commitSha);
    }

<<<<<<< HEAD
    if (autoAssign && issueContext.author !== 'unknown') {
      await this.assignIssueToAuthor(issueContext.number, issueContext.author);
    }

=======
>>>>>>> origin/main
    if (addComment) {
      await this.addCommentToIssue(issueContext.number, finalBranchName, linkedToIssue);
    }

    return {
      branchName: finalBranchName,
      originalName: sanitizedName,
      wasDuplicate,
      commitSha,
      linkedToIssue
    };
  }

  /**
   * Creates a branch linked to an issue using GraphQL API.
   *
   * @param issueNodeId - The Node ID of the issue
   * @param branchName - Name of the branch to create
   * @param commitSha - SHA of the commit to base the branch on
   * @returns True if the branch was successfully linked
   */
  private async createLinkedBranchViaGraphQL(
    issueNodeId: string,
    branchName: string,
    commitSha: string
  ): Promise<boolean> {
    core.info(`Creating linked branch "${branchName}" via GraphQL API...`);

    const mutation = `
      mutation CreateLinkedBranch($issueId: ID!, $oid: GitObjectID!, $name: String!) {
        createLinkedBranch(input: {issueId: $issueId, oid: $oid, name: $name}) {
          linkedBranch {
            ref {
              name
            }
          }
          issue {
            number
          }
        }
      }
    `;

    try {
      await this.octokit.graphql(mutation, {
        issueId: issueNodeId,
        oid: commitSha,
        name: branchName
      });

      return true;
    } catch (error) {
      throw new Error(`GraphQL mutation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Creates a branch using the REST API (fallback method).
   *
   * @param branchName - Name of the branch to create
   * @param commitSha - SHA of the commit to base the branch on
   */
  private async createBranchViaREST(branchName: string, commitSha: string): Promise<void> {
    core.info(`Creating branch "${branchName}" via REST API...`);

    try {
      await this.octokit.rest.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`,
        sha: commitSha
      });

      core.info(`Branch "${branchName}" created successfully.`);
    } catch (error) {
      throw new Error(`Failed to create branch "${branchName}": ${(error as Error).message}`);
    }
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
<<<<<<< HEAD
   * Assigns the issue to a specific user.
   *
   * @param issueNumber - Issue number to assign
   * @param assignee - Username to assign the issue to
   */
  async assignIssueToAuthor(issueNumber: number, assignee: string): Promise<void> {
    core.info(`Assigning issue #${issueNumber} to "${assignee}"...`);

    try {
      await this.octokit.rest.issues.addAssignees({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        assignees: [assignee]
      });

      core.info(`Issue #${issueNumber} assigned to "${assignee}" successfully.`);
    } catch (error) {
      core.warning(`Failed to assign issue #${issueNumber} to "${assignee}": ${(error as Error).message}`);
    }
  }

  /**
=======
>>>>>>> origin/main
   * Adds a comment to an issue with the created branch name.
   *
   * @param issueNumber - Issue number to comment on
   * @param branchName - Name of the created branch
   * @param isLinked - Whether the branch is linked to the issue
   */
  async addCommentToIssue(issueNumber: number, branchName: string, isLinked: boolean): Promise<void> {
    core.info(`Adding comment to issue #${issueNumber} with branch name "${branchName}".`);

    const linkedInfo = isLinked ? ' and linked to this issue in the Development section' : '';
    const commentBody = `Branch \`${branchName}\` has been created for this issue${linkedInfo}. 🚀`;

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

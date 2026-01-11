import * as core from '@actions/core';
import * as github from '@actions/github';
import { BranchManager } from './services/branch-manager';
import { validateInputs } from './utils/validators';
import { ActionInputs, IssueContext, SanitizationConfig } from './types';

/**
 * Reads and parses action inputs.
 *
 * @returns Parsed action inputs
 */
function getInputs(): ActionInputs {
  return {
    addComment: core.getBooleanInput('add_comment'),
<<<<<<< HEAD
    autoAssign: core.getBooleanInput('auto_assign'),
=======
>>>>>>> origin/main
    baseBranch: core.getInput('base_branch', { required: false }) || 'main',
    branchPrefix: core.getInput('branch_prefix', { required: false }) || '',
    githubToken: core.getInput('github_token', { required: true }),
    linkToIssue: core.getBooleanInput('link_to_issue'),
    maxLength: parseInt(core.getInput('max_length', { required: false }) || '100', 10),
    skipLabels: core.getInput('skip_labels', { required: false }) || '',
    useLabelPrefix: core.getBooleanInput('use_label_prefix')
  };
}

/**
 * Extracts issue context from the GitHub event payload.
 *
 * @returns Issue context information
 * @throws Error if the event is not an issue event
 */
function getIssueContext(): IssueContext {
  const { payload, repo } = github.context;

  if (!payload.issue) {
    throw new Error('This action can only be triggered by issue events.');
  }

  const issue = payload.issue as {
    number: number;
    title: string;
    labels?: Array<{ name: string }>;
    user?: { login: string };
    node_id?: string;
  };

  const labels = (issue.labels || []).map((label) => label.name);

  return {
    number: issue.number,
    title: issue.title,
    labels,
    author: issue.user?.login || 'unknown',
    owner: repo.owner,
    repo: repo.repo,
    nodeId: issue.node_id
  };
}

/**
 * Checks if the issue should be skipped based on labels.
 *
 * @param issueLabels - Labels attached to the issue
 * @param skipLabels - Comma-separated list of labels to skip
 * @returns True if the issue should be skipped
 */
function shouldSkipIssue(issueLabels: string[], skipLabels: string): boolean {
  if (!skipLabels || skipLabels.trim().length === 0) {
    return false;
  }

  const skipLabelList = skipLabels.split(',').map((label) => label.trim().toLowerCase());
  const issueLabelList = issueLabels.map((label) => label.toLowerCase());

  return skipLabelList.some((skipLabel) => issueLabelList.includes(skipLabel));
}

/**
 * Main entry point for the GitHub Action.
 */
async function run(): Promise<void> {
  try {
    core.info('Starting Branch on Issue Action.');

    const inputs = getInputs();
    const githubApiUrl = core.getInput('github_api_url');

    core.info(`Base branch: ${inputs.baseBranch}`);
    core.info(`Branch prefix: ${inputs.branchPrefix || '(none)'}`);
    core.info(`Max length: ${inputs.maxLength}`);
    core.info(`Use label prefix: ${inputs.useLabelPrefix}`);
    core.info(`Add comment: ${inputs.addComment}`);
<<<<<<< HEAD
    core.info(`Auto assign: ${inputs.autoAssign}`);
=======
>>>>>>> origin/main
    core.info(`Link to issue: ${inputs.linkToIssue}`);
    core.info(`Skip labels: ${inputs.skipLabels || '(none)'}`);
    core.info(`GitHub API URL: ${githubApiUrl || '(default)'}`);

    validateInputs(inputs);

    const issueContext = getIssueContext();
    core.info(`Issue #${issueContext.number}: "${issueContext.title}"`);
    core.info(`Repository: ${issueContext.owner}/${issueContext.repo}`);
    core.info(`Labels: ${issueContext.labels.join(', ') || '(none)'}`);

    if (shouldSkipIssue(issueContext.labels, inputs.skipLabels)) {
      core.info(`Issue has skip label. Skipping branch creation.`);
      return;
    }

    const prefix =
      inputs.useLabelPrefix && issueContext.labels.length > 0 ? issueContext.labels[0] : inputs.branchPrefix;

    const config: SanitizationConfig = {
      prefix,
      maxLength: inputs.maxLength
    };

    const branchManager = new BranchManager(
      inputs.githubToken,
      issueContext.owner,
      issueContext.repo,
      githubApiUrl || undefined
    );

    const result = await branchManager.createBranch(
      issueContext,
      config,
      inputs.baseBranch,
      inputs.addComment,
<<<<<<< HEAD
      inputs.linkToIssue,
      inputs.autoAssign
=======
      inputs.linkToIssue
>>>>>>> origin/main
    );

    core.setOutput('branch_name', result.branchName);
    core.setOutput('original_name', result.originalName);
    core.setOutput('was_duplicate', result.wasDuplicate.toString());
    core.setOutput('linked_to_issue', result.linkedToIssue.toString());

    core.info('');
    core.info('Branch on Issue Action completed successfully.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(`Action failed: ${errorMessage}`);
  }
}

void run();

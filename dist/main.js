"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const branch_manager_1 = require("./services/branch-manager");
const validators_1 = require("./utils/validators");
/**
 * Reads and parses action inputs.
 *
 * @returns Parsed action inputs
 */
function getInputs() {
    return {
        addComment: core.getBooleanInput('add_comment'),
        autoAssign: core.getBooleanInput('auto_assign'),
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
function getIssueContext() {
    const { payload, repo } = github.context;
    if (!payload.issue) {
        throw new Error('This action can only be triggered by issue events.');
    }
    const issue = payload.issue;
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
function shouldSkipIssue(issueLabels, skipLabels) {
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
async function run() {
    try {
        core.info('Starting Branch on Issue Action.');
        const inputs = getInputs();
        const githubApiUrl = core.getInput('github_api_url');
        core.info(`Base branch: ${inputs.baseBranch}`);
        core.info(`Branch prefix: ${inputs.branchPrefix || '(none)'}`);
        core.info(`Max length: ${inputs.maxLength}`);
        core.info(`Use label prefix: ${inputs.useLabelPrefix}`);
        core.info(`Add comment: ${inputs.addComment}`);
        core.info(`Auto assign: ${inputs.autoAssign}`);
        core.info(`Link to issue: ${inputs.linkToIssue}`);
        core.info(`Skip labels: ${inputs.skipLabels || '(none)'}`);
        core.info(`GitHub API URL: ${githubApiUrl || '(default)'}`);
        (0, validators_1.validateInputs)(inputs);
        const issueContext = getIssueContext();
        core.info(`Issue #${issueContext.number}: "${issueContext.title}"`);
        core.info(`Repository: ${issueContext.owner}/${issueContext.repo}`);
        core.info(`Labels: ${issueContext.labels.join(', ') || '(none)'}`);
        if (shouldSkipIssue(issueContext.labels, inputs.skipLabels)) {
            core.info(`Issue has skip label. Skipping branch creation.`);
            return;
        }
        const prefix = inputs.useLabelPrefix && issueContext.labels.length > 0 ? issueContext.labels[0] : inputs.branchPrefix;
        const config = {
            prefix,
            maxLength: inputs.maxLength
        };
        const branchManager = new branch_manager_1.BranchManager(inputs.githubToken, issueContext.owner, issueContext.repo, githubApiUrl || undefined);
        const result = await branchManager.createBranch(issueContext, config, inputs.baseBranch, inputs.addComment, inputs.linkToIssue, inputs.autoAssign);
        core.setOutput('branch_name', result.branchName);
        core.setOutput('original_name', result.originalName);
        core.setOutput('was_duplicate', result.wasDuplicate.toString());
        core.setOutput('linked_to_issue', result.linkedToIssue.toString());
        core.info('');
        core.info('Branch on Issue Action completed successfully.');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        core.setFailed(`Action failed: ${errorMessage}`);
    }
}
void run();
//# sourceMappingURL=main.js.map
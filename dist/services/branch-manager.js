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
exports.BranchManager = void 0;
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const sanitizer_1 = require("../utils/sanitizer");
/**
 * Manages GitHub branch creation via the GitHub API.
 */
class BranchManager {
    octokit;
    owner;
    repo;
    /**
     * Creates a new BranchManager instance.
     *
     * @param token - GitHub token used for authentication
     * @param owner - Repository owner
     * @param repo - Repository name
     * @param apiUrl - Base URL of the GitHub API (for GitHub Enterprise)
     */
    constructor(token, owner, repo, apiUrl) {
        this.octokit = (0, github_1.getOctokit)(token, { baseUrl: apiUrl });
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
    async createBranch(issueContext, config, baseBranch, addComment) {
        core.info(`Creating branch for issue #${issueContext.number}: "${issueContext.title}"`);
        const sanitizedName = (0, sanitizer_1.sanitizeBranchName)(issueContext.title, config);
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
        }
        catch (error) {
            throw new Error(`Failed to create branch "${finalBranchName}": ${error.message}`);
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
    async branchExists(branchName) {
        core.debug(`Checking if branch "${branchName}" exists...`);
        try {
            await this.octokit.rest.repos.getBranch({
                owner: this.owner,
                repo: this.repo,
                branch: branchName
            });
            core.debug(`Branch "${branchName}" exists.`);
            return true;
        }
        catch (error) {
            if (error.status === 404) {
                core.debug(`Branch "${branchName}" does not exist.`);
                return false;
            }
            throw new Error(`Failed to check if branch "${branchName}" exists: ${error.message}`);
        }
    }
    /**
     * Handles duplicate branch names by appending a numeric suffix.
     *
     * @param baseName - Base branch name that already exists
     * @returns New branch name with numeric suffix that doesn't exist
     */
    async handleDuplicateBranch(baseName) {
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
    async getBaseBranchSha(branchName) {
        core.debug(`Fetching SHA for base branch "${branchName}"...`);
        try {
            const { data } = await this.octokit.rest.repos.getBranch({
                owner: this.owner,
                repo: this.repo,
                branch: branchName
            });
            return data.commit.sha;
        }
        catch (error) {
            throw new Error(`Failed to get SHA for base branch "${branchName}": ${error.message}`);
        }
    }
    /**
     * Adds a comment to an issue with the created branch name.
     *
     * @param issueNumber - Issue number to comment on
     * @param branchName - Name of the created branch
     */
    async addCommentToIssue(issueNumber, branchName) {
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
        }
        catch (error) {
            throw new Error(`Failed to add comment to issue #${issueNumber}: ${error.message}`);
        }
    }
}
exports.BranchManager = BranchManager;
//# sourceMappingURL=branch-manager.js.map
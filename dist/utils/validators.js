"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGitHubToken = validateGitHubToken;
exports.validateBaseBranch = validateBaseBranch;
exports.validateMaxLength = validateMaxLength;
exports.validateInputs = validateInputs;
/**
 * Validates the GitHub token.
 *
 * @param token - GitHub token to validate
 * @throws Error if the token is invalid
 */
function validateGitHubToken(token) {
    if (!token || token.trim().length === 0) {
        throw new Error('Input "github_token" must not be empty.');
    }
}
/**
 * Validates the base branch name.
 *
 * @param branch - Branch name to validate
 * @throws Error if the branch name is invalid
 */
function validateBaseBranch(branch) {
    if (!branch || branch.trim().length === 0) {
        throw new Error('Input "base_branch" must not be empty.');
    }
}
/**
 * Validates the maximum branch name length.
 *
 * @param length - Maximum length to validate
 * @throws Error if the length is invalid
 */
function validateMaxLength(length) {
    if (length <= 0) {
        throw new Error('Input "max_length" must be greater than 0.');
    }
    if (length < 10) {
        throw new Error('Input "max_length" must be at least 10 characters.');
    }
}
/**
 * Validates all action inputs.
 *
 * @param inputs - Action inputs to validate
 * @throws Error if any input is invalid
 */
function validateInputs(inputs) {
    validateGitHubToken(inputs.githubToken);
    validateBaseBranch(inputs.baseBranch);
    validateMaxLength(inputs.maxLength);
}
//# sourceMappingURL=validators.js.map
import { ActionInputs } from '../types';

/**
 * Validates the GitHub token.
 *
 * @param token - GitHub token to validate
 * @throws Error if the token is invalid
 */
export function validateGitHubToken(token: string): void {
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
export function validateBaseBranch(branch: string): void {
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
export function validateMaxLength(length: number): void {
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
export function validateInputs(inputs: ActionInputs): void {
  validateGitHubToken(inputs.githubToken);
  validateBaseBranch(inputs.baseBranch);
  validateMaxLength(inputs.maxLength);
}

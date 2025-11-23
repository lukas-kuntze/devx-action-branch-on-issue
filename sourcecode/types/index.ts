/**
 * Input parameters for the GitHub Action.
 */
export interface ActionInputs {
  /** If enabled, adds a comment to the issue containing the generated branch name */
  addComment: boolean;

  /** The base branch from which new branches will be created */
  baseBranch: string;

  /** Optional prefix for generated branch names (e.g., "feature" results in "feature/branch-name") */
  branchPrefix: string;

  /** GitHub token used for authenticating API requests */
  githubToken: string;

<<<<<<< HEAD
  /** If enabled, links the created branch to the issue using GraphQL API */
  linkToIssue: boolean;

=======
>>>>>>> origin/develop
  /** Specifies the maximum allowed length for branch names */
  maxLength: number;

  /** Comma-separated list of labels that should prevent automatic branch creation */
  skipLabels: string;

  /** Determines whether issue labels should be used as branch prefixes */
  useLabelPrefix: boolean;
}

/**
 * Output values of the GitHub Action.
 */
export interface ActionOutputs {
  /** The final name of the created branch */
  branchName: string;

<<<<<<< HEAD
  /** Indicates whether the branch was successfully linked to the issue */
  linkedToIssue: boolean;

=======
>>>>>>> origin/develop
  /** The sanitized branch name before duplicate handling was applied */
  originalName: string;

  /** Indicates whether the initial branch name had to be modified due to duplication */
  wasDuplicate: boolean;
}

/**
 * Result of a branch creation operation.
 */
export interface BranchCreationResult {
  /** The final name of the created branch */
  branchName: string;

  /** The SHA of the commit the branch points to */
  commitSha: string;

<<<<<<< HEAD
  /** Whether the branch was successfully linked to the issue */
  linkedToIssue: boolean;

=======
>>>>>>> origin/develop
  /** The original sanitized name before duplicate handling */
  originalName: string;

  /** Whether the branch name was modified due to duplication */
  wasDuplicate: boolean;
}

/**
 * Context information about the issue that triggered the action.
 */
export interface IssueContext {
  /** Username of the issue author */
  author: string;

  /** Array of label names attached to the issue */
  labels: string[];

<<<<<<< HEAD
  /** Issue Node ID (for GraphQL API) */
  nodeId?: string;

=======
>>>>>>> origin/develop
  /** Issue number */
  number: number;

  /** Repository owner */
  owner: string;

  /** Repository name */
  repo: string;

  /** Issue title */
  title: string;
}

/**
 * Configuration for branch name sanitization.
 */
export interface SanitizationConfig {
<<<<<<< HEAD
=======
  /** The first label name (if useLabelPrefix is true) */
  labelPrefix?: string;

>>>>>>> origin/develop
  /** Maximum allowed length for the branch name */
  maxLength: number;

  /** Optional prefix to add to the branch name */
  prefix: string;
<<<<<<< HEAD
=======

  /** Whether to use the first label as prefix */
  useLabelPrefix: boolean;
>>>>>>> origin/develop
}

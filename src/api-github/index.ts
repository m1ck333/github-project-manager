/**
 * GitHub API Module
 *
 * This is the main entry point for all GitHub API operations.
 * It provides the GitHub client and utility functions for GraphQL operations.
 */
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { OperationContext, CombinedError } from "@urql/core";

import { githubClient } from "./client";

// Re-export the client
export { githubClient };

// Define types for GitHub API responses
export type GitHubResponse<T = unknown> = {
  data?: T;
  error?:
    | {
        message: string;
        extensions?: Record<string, unknown>;
      }
    | CombinedError;
};

/**
 * Execute a GitHub GraphQL query with proper typing
 * @param query GraphQL query as TypedDocumentNode
 * @param variables Query variables
 * @param context Additional context options
 * @returns Response with data or error
 */
export async function executeGitHubQuery<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  query: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  context?: Partial<OperationContext>
): Promise<GitHubResponse<TData>> {
  try {
    const response = await githubClient
      .query<TData, TVariables>(query, variables || ({} as TVariables), context)
      .toPromise();
    return {
      data: response.data,
      error: response.error,
    };
  } catch (error) {
    return {
      error:
        error instanceof CombinedError
          ? error
          : { message: error instanceof Error ? error.message : "Unknown error occurred" },
    };
  }
}

/**
 * Execute a GitHub GraphQL mutation with proper typing
 * @param mutation GraphQL mutation as TypedDocumentNode
 * @param variables Mutation variables
 * @param context Additional context options
 * @returns Response with data or error
 */
export async function executeGitHubMutation<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  mutation: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  context?: Partial<OperationContext>
): Promise<GitHubResponse<TData>> {
  try {
    const response = await githubClient
      .mutation<TData, TVariables>(mutation, variables || ({} as TVariables), context)
      .toPromise();
    return {
      data: response.data,
      error: response.error,
    };
  } catch (error) {
    return {
      error:
        error instanceof CombinedError
          ? error
          : { message: error instanceof Error ? error.message : "Unknown error occurred" },
    };
  }
}

/**
 * GitHub API Hook
 *
 * This hook provides React components with access to GitHub API
 * through the executeGitHubQuery and executeGitHubMutation functions.
 */
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useState, useCallback } from "react";

import { executeGitHubQuery, executeGitHubMutation } from "@/api-github";

import { getErrorMessage } from "../utils/errors.utils";

import { useAsync } from "./use-async";

// Hook options type
interface UseGitHubOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for interacting with GitHub API in React components
 */
export function useGitHub<TData = unknown>() {
  const { execute, isLoading, error, resetError } = useAsync();
  const [data, setData] = useState<TData | null>(null);

  /**
   * Execute a GitHub GraphQL query
   */
  const query = useCallback(
    async <TVariables extends Record<string, unknown> = Record<string, unknown>>(
      document: TypedDocumentNode<TData, TVariables>,
      variables?: TVariables,
      options?: UseGitHubOptions<TData>
    ) => {
      resetError();

      const result = await execute(async () => {
        const response = await executeGitHubQuery<TData, TVariables>(document, variables);

        if (response.error) {
          throw new Error(getErrorMessage(response.error));
        }

        return response.data as TData;
      });

      if (result) {
        setData(result);
        options?.onSuccess?.(result);
        return { data: result };
      }

      if (error) {
        const errorObj = new Error(error);
        options?.onError?.(errorObj);
        return { error: errorObj };
      }

      return { error: new Error("Unknown error") };
    },
    [execute, error, resetError]
  );

  /**
   * Execute a GitHub GraphQL mutation
   */
  const mutation = useCallback(
    async <TVariables extends Record<string, unknown> = Record<string, unknown>>(
      document: TypedDocumentNode<TData, TVariables>,
      variables?: TVariables,
      options?: UseGitHubOptions<TData>
    ) => {
      resetError();

      const result = await execute(async () => {
        const response = await executeGitHubMutation<TData, TVariables>(document, variables);

        if (response.error) {
          throw new Error(getErrorMessage(response.error));
        }

        return response.data as TData;
      });

      if (result) {
        setData(result);
        options?.onSuccess?.(result);
        return { data: result };
      }

      if (error) {
        const errorObj = new Error(error);
        options?.onError?.(errorObj);
        return { error: errorObj };
      }

      return { error: new Error("Unknown error") };
    },
    [execute, error, resetError]
  );

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    resetError();
    setData(null);
  }, [resetError]);

  return {
    query,
    mutation,
    loading: isLoading,
    data,
    error: error ? new Error(error) : null,
    reset,
  };
}

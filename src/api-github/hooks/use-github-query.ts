/**
 * Hook for executing GitHub GraphQL queries
 *
 * This hook provides a convenient way to execute GitHub GraphQL queries with
 * automatic loading state and error handling.
 */
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { useState } from "react";

import { executeGitHubQuery, executeGitHubMutation } from "@/api-github";
import { useAsync } from "@/common/hooks";
import { getErrorMessage } from "@/common/utils/errors.utils";

interface UseGitHubQueryOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for executing GitHub GraphQL queries with automatic loading and error handling
 */
export function useGitHubQuery<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>() {
  const { execute, isLoading, error, resetError } = useAsync();
  const [data, setData] = useState<TData | null>(null);

  /**
   * Execute a GitHub GraphQL query with automatic loading and error handling
   */
  const query = async (
    document: TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
    options?: UseGitHubQueryOptions<TData>
  ): Promise<{ data?: TData; error?: Error }> => {
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

    return { error: error ? new Error(error) : undefined };
  };

  /**
   * Execute a GitHub GraphQL mutation with automatic loading and error handling
   */
  const mutation = async (
    document: TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
    options?: UseGitHubQueryOptions<TData>
  ): Promise<{ data?: TData; error?: Error }> => {
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

    return { error: error ? new Error(error) : undefined };
  };

  const reset = () => {
    resetError();
    setData(null);
  };

  return {
    loading: isLoading,
    error: error ? new Error(error) : null,
    data,
    query,
    mutation,
    reset,
  };
}

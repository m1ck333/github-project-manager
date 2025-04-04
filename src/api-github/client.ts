/**
 * GraphQL Client for GitHub API
 *
 * This file sets up the URQL GraphQL client specifically for GitHub API operations.
 * It should be the primary client used for all GitHub API interactions.
 */
import { Client, fetchExchange } from "@urql/core";

import { env } from "@/common/config/env";
import { GITHUB_GRAPHQL_API_URL } from "@/common/constants/github.const";

/**
 * Create the GitHub API client instance
 * This is the official client for all GitHub operations
 */
export const githubClient = new Client({
  url: GITHUB_GRAPHQL_API_URL,
  fetchOptions: () => {
    // Get the latest token each time a request is made
    return {
      headers: {
        Authorization: env.githubToken ? `Bearer ${env.githubToken}` : "",
      },
    };
  },
  exchanges: [fetchExchange],
});

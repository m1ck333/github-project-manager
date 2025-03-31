/**
 * GraphQL Client Configuration
 *
 * This file sets up the URQL GraphQL client for the application.
 * It configures the client with the GitHub GraphQL API endpoint and
 * adds authentication headers using the GitHub token from environment variables.
 */
import { Client, fetchExchange } from "@urql/core";

import { env } from "../config/env";
import { GITHUB_GRAPHQL_API_URL } from "../constants/github";

// Create the client instance
export const client = new Client({
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

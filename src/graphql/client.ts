/**
 * GraphQL Client Configuration
 *
 * This file sets up the URQL GraphQL client for the application.
 * It configures the client with the GitHub GraphQL API endpoint and
 * adds authentication headers using the GitHub token from environment variables.
 */
import { Client, fetchExchange } from "@urql/core";
import { GITHUB_GRAPHQL_API_URL } from "../constants/api";

// Initialize urql client
const token = import.meta.env.VITE_GITHUB_TOKEN;

// Create the client instance
export const client = new Client({
  url: GITHUB_GRAPHQL_API_URL,
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
  exchanges: [fetchExchange],
});

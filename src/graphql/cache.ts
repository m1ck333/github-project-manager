/**
 * GraphQL Cache Configuration
 *
 * This file contains cache configuration for the URQL client.
 * It helps optimize data fetching by reducing duplicate requests.
 */
import { cacheExchange } from "@urql/core";
import { offlineExchange } from "@urql/exchange-graphcache";
import { relayPagination } from "@urql/exchange-graphcache/extras";

/**
 * Basic cache exchange configuration
 */
export const basicCache = cacheExchange({
  // No custom configuration needed for basic use cases
});

/**
 * Advanced cache configuration with pagination support
 * This is useful for optimizing list queries like projects and issues
 */
export const advancedCache = offlineExchange({
  schema: undefined, // Will be populated by codegen in a production setup
  keys: {
    ProjectV2: (data) => data.id as string,
    Issue: (data) => data.id as string,
  },
  resolvers: {
    Query: {
      // Support for relay-style pagination for project items
      projectV2Items: relayPagination(),
    },
  },
});

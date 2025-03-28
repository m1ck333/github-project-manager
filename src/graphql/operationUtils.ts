/**
 * GraphQL Operation Utilities
 *
 * Utility functions for working with named GraphQL operations
 * to make them easier to identify in the network tab.
 */
import { DocumentNode } from "graphql";

import { client } from "./client";

// Variables type that matches urql's requirements
type AnyVariables = { [key: string]: unknown };

/**
 * Execute a GraphQL query with a named operation
 *
 * @param document The GraphQL document to execute
 * @param variables The variables to pass to the query
 * @param operationName The name to show in the network tab
 * @returns The query result
 */
export function executeNamedQuery<TData, TVariables extends AnyVariables>(
  document: DocumentNode,
  variables: TVariables,
  operationName: string
) {
  return client.query<TData, TVariables>(document, variables, { name: operationName });
}

/**
 * Execute a GraphQL mutation with a named operation
 *
 * @param document The GraphQL document to execute
 * @param variables The variables to pass to the mutation
 * @param operationName The name to show in the network tab
 * @returns The mutation result
 */
export function executeNamedMutation<TData, TVariables extends AnyVariables>(
  document: DocumentNode,
  variables: TVariables,
  operationName: string
) {
  return client.mutation<TData, TVariables>(document, variables, { name: operationName });
}

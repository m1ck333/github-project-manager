import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { DocumentNode } from "graphql";

import { client } from "../api/client";

/**
 * Service responsible for making GraphQL queries and mutations
 * Acts as a wrapper around the URQL client
 */
export class GraphQLClientService {
  /**
   * Execute a GraphQL query with variables
   */
  async query<Data, Variables>(
    document: DocumentNode | TypedDocumentNode<Data, Variables>,
    variables?: Variables
  ): Promise<Data> {
    const { data, error } = await client.query(document, variables || {}).toPromise();

    if (error) {
      throw new Error(`GraphQL Error: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from GraphQL query");
    }

    return data;
  }

  /**
   * Execute a GraphQL mutation with variables
   */
  async mutation<Data, Variables>(
    document: DocumentNode | TypedDocumentNode<Data, Variables>,
    variables?: Variables
  ): Promise<Data> {
    const { data, error } = await client.mutation(document, variables || {}).toPromise();

    if (error) {
      throw new Error(`GraphQL Error: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from GraphQL mutation");
    }

    return data;
  }
}

export const graphQLClientService = new GraphQLClientService();

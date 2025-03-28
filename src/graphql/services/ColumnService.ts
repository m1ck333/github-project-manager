/**
 * Column Service
 *
 * Service class to handle all column-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { gql } from "urql";

import { Column, ColumnFormData, ColumnType } from "../../types";
import { client } from "../client";
import { getFragmentData } from "../generated/fragment-masking";
import { GetColumnsDocument, ColumnFieldsFragmentDoc } from "../generated/graphql";

/**
 * Service for managing project columns (status fields)
 */
export class ColumnService {
  private client = client;

  /**
   * Query to get Status field ID and options for a project
   */
  private GET_STATUS_FIELD = gql`
    query GetStatusField($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 20) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  `;

  /**
   * Mutation to create a Status field if it doesn't exist
   */
  private CREATE_STATUS_FIELD = gql`
    mutation CreateStatusField($projectId: ID!) {
      createProjectV2Field(
        input: { projectId: $projectId, name: "Status", dataType: SINGLE_SELECT }
      ) {
        projectV2Field {
          id
          name
        }
      }
    }
  `;

  /**
   * Get columns for a project
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async getColumns(projectId: string): Promise<Column[]> {
    const { data, error } = await this.client.query(GetColumnsDocument, { projectId }).toPromise();

    if (error || !data?.node) {
      console.error("Error fetching columns:", error);
      return [];
    }

    if (data.node.__typename !== "ProjectV2" || !data.node.fields?.nodes) {
      return [];
    }

    // Find the Status field and extract its options
    const statusField = data.node.fields.nodes.find(
      (field: any) =>
        field && field.__typename === "ProjectV2SingleSelectField" && field.name === "Status"
    );

    if (
      !statusField ||
      statusField.__typename !== "ProjectV2SingleSelectField" ||
      !statusField.options
    ) {
      return [];
    }

    const columnData = getFragmentData(ColumnFieldsFragmentDoc, statusField);

    // Map options to our Column type
    return columnData.options.map((option) => ({
      id: option.id,
      name: option.name,
      type: this.mapNameToColumnType(option.name),
    }));
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  /**
   * Helper to get or create a Status field
   */
  private async getOrCreateStatusField(projectId: string): Promise<string | null> {
    // First try to get existing Status field
    const { data: fieldData } = await this.client
      .query(this.GET_STATUS_FIELD, { projectId })
      .toPromise();

    if (fieldData?.node && fieldData.node.__typename === "ProjectV2") {
      const statusField = fieldData.node.fields.nodes.find(
        (field) =>
          field && field.__typename === "ProjectV2SingleSelectField" && field.name === "Status"
      );

      if (statusField) {
        return statusField.id;
      }
    }

    // If no Status field exists, create one
    const { data: createData, error } = await this.client
      .mutation(this.CREATE_STATUS_FIELD, { projectId })
      .toPromise();

    if (error || !createData?.createProjectV2Field?.projectV2Field?.id) {
      console.error("Error creating Status field:", error);
      return null;
    }

    return createData.createProjectV2Field.projectV2Field.id;
  }

  /**
   * Map column name to a column type enum
   */
  private mapNameToColumnType(name: string): ColumnType {
    const normalizedName = name.toUpperCase();

    if (normalizedName.includes("TODO") || normalizedName.includes("TO DO")) {
      return ColumnType.TODO;
    }
    if (normalizedName.includes("PROGRESS") || normalizedName.includes("DOING")) {
      return ColumnType.IN_PROGRESS;
    }
    if (normalizedName.includes("DONE") || normalizedName.includes("COMPLETED")) {
      return ColumnType.DONE;
    }
    if (normalizedName.includes("BACKLOG")) {
      return ColumnType.BACKLOG;
    }

    // Default to TODO
    return ColumnType.TODO;
  }

  /**
   * Map column type to a color
   */
  private getColorForColumnType(type: ColumnType): string {
    switch (type) {
      case ColumnType.TODO:
        return "BLUE";
      case ColumnType.IN_PROGRESS:
        return "YELLOW";
      case ColumnType.DONE:
        return "GREEN";
      case ColumnType.BACKLOG:
        return "PURPLE";
      default:
        return "GRAY";
    }
  }

  /**
   * Create a new column (status option)
   * TODO: Implement this method to add a status option to the Status field
   */
  async createColumn(_projectId: string, _columnData: ColumnFormData): Promise<Column | null> {
    // This would require:
    // 1. Getting the Status field ID
    // 2. Using the updateProjectV2FieldOption mutation to add an option

    console.warn("createColumn not implemented yet");
    return null;
  }

  /**
   * Delete a column (status option)
   * TODO: Implement this method to remove a status option from the Status field
   */
  async deleteColumn(_projectId: string, _columnId: string): Promise<boolean> {
    // This would require:
    // 1. Getting the Status field ID
    // 2. Using the deleteProjectV2FieldOption mutation to remove the option

    console.warn("deleteColumn not implemented yet");
    return false;
  }
}

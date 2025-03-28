/**
 * Column Service
 *
 * Service class to handle all column-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { Column, ColumnFormData, ColumnType } from "../../types";
import { client } from "../client";
import { GetColumnsDocument } from "../operations/operation-names";

/**
 * Service for managing project columns (status fields)
 */
export class ColumnService {
  private client = client;

  /**
   * Get columns for a project
   */
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
    const statusField = data.node.fields.nodes.find((field) => {
      if (!field) return false;
      return field.__typename === "ProjectV2SingleSelectField" && field.name === "Status";
    });

    if (
      !statusField ||
      statusField.__typename !== "ProjectV2SingleSelectField" ||
      !statusField.options
    ) {
      return [];
    }

    // Directly use the options from the statusField
    // Map options to our Column type
    return statusField.options.map((option: { id: string; name: string }) => ({
      id: option.id,
      name: option.name,
      type: this.mapNameToColumnType(option.name),
    }));
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

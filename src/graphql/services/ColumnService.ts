/**
 * Column Service
 *
 * Service class to handle all column-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { gql } from "urql";

import { Column, ColumnFormData, ColumnType } from "../../types";
import { client } from "../client";

// ProjectV2SingleSelectFieldOptionColor enum
export enum ProjectV2SingleSelectFieldOptionColor {
  BLUE = "BLUE",
  GRAY = "GRAY",
  GREEN = "GREEN",
  ORANGE = "ORANGE",
  PINK = "PINK",
  PURPLE = "PURPLE",
  RED = "RED",
  YELLOW = "YELLOW",
}

// Define GraphQL documents
const GetColumnsDocument = gql`
  query GetColumns($projectId: ID!) {
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

const AddColumnDocument = gql`
  mutation AddColumnToProject(
    $fieldId: ID!
    $name: String!
    $color: ProjectV2SingleSelectFieldOptionColor!
  ) {
    updateProjectV2Field(
      input: {
        fieldId: $fieldId
        singleSelectOptions: [{ name: $name, color: $color, description: "" }]
      }
    ) {
      projectV2Field {
        ... on ProjectV2SingleSelectField {
          id
          options {
            id
            name
            color
          }
        }
      }
    }
  }
`;

const UpdateColumnDocument = gql`
  mutation UpdateColumn($fieldId: ID!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
    updateProjectV2Field(input: { fieldId: $fieldId, singleSelectOptions: $options }) {
      projectV2Field {
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
`;

const DeleteColumnDocument = gql`
  mutation DeleteColumn($fieldId: ID!) {
    deleteProjectV2Field(input: { fieldId: $fieldId }) {
      clientMutationId
    }
  }
`;

// Type definitions for GraphQL responses
interface ProjectFieldNode {
  __typename?: string;
  id?: string;
  name?: string;
  options?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

// Extended interface for Status field
interface StatusFieldNode extends ProjectFieldNode {
  name: string;
  options: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

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

    // Check if we have fields and nodes
    if (!data.node.fields?.nodes) {
      return [];
    }

    // Find the Status field and extract its options
    const statusField = data.node.fields.nodes.find((field: ProjectFieldNode) => {
      if (!field) return false;
      // Make sure the field is named "Status" and has options
      return field.name === "Status" && Array.isArray(field.options);
    }) as StatusFieldNode | undefined;

    if (!statusField || !statusField.options) {
      return [];
    }

    // Map options to our Column type
    const columns = statusField.options.map(
      (option: { id: string; name: string; color?: string }) => ({
        id: option.id,
        name: option.name,
        type: this.mapNameToColumnType(option.name),
      })
    );

    return columns;
  }

  /**
   * Add a new column (status field option) to a project
   */
  async addColumn(projectId: string, columnData: ColumnFormData): Promise<Column | null> {
    try {
      // First, get the status field ID
      const statusFieldId = await this.getStatusFieldId(projectId);
      if (!statusFieldId) {
        console.error("Status field not found in project");
        return null;
      }

      // Get all existing columns/options
      const existingColumns = await this.getColumns(projectId);

      // Generate a color based on the column type
      const color = this.getColorForColumnType(columnData.type);

      // Create the new option to add
      const newOption = {
        name: columnData.name,
        color: color,
        description: "",
      };

      // Create an array with all existing options plus the new one
      const allOptions = existingColumns.map((col) => ({
        name: col.name,
        color: this.getColorForColumnType(col.type),
        description: "",
      }));

      // Add the new option
      allOptions.push(newOption);

      // Update the Status field with all options including the new one
      const { data, error } = await this.client
        .mutation(UpdateColumnDocument, {
          fieldId: statusFieldId,
          options: allOptions,
        })
        .toPromise();

      if (error || !data?.updateProjectV2Field?.projectV2Field) {
        console.error("Error creating column:", error);
        return null;
      }

      const field = data.updateProjectV2Field.projectV2Field;
      if (!field.options || field.options.length === 0) {
        console.error("No options returned after creating column");
        return null;
      }

      // Find the newly added option (should match our new name)
      const newOptionFromResponse = field.options.find(
        (opt: { id: string; name: string; color?: string }) => opt.name === columnData.name
      );

      if (!newOptionFromResponse) {
        console.error("Could not find newly created column option");
        return null;
      }

      return {
        id: newOptionFromResponse.id,
        name: newOptionFromResponse.name,
        type: columnData.type,
      };
    } catch (err) {
      console.error("Exception adding column:", err);
      return null;
    }
  }

  /**
   * Get the Status field ID for a project
   */
  private async getStatusFieldId(projectId: string): Promise<string | null> {
    const { data, error } = await this.client.query(GetColumnsDocument, { projectId }).toPromise();

    if (error || !data?.node) {
      console.error("Error fetching project fields:", error);
      return null;
    }

    if (!data.node.fields?.nodes) {
      return null;
    }

    // Find the Status field
    const statusField = data.node.fields.nodes.find((field: ProjectFieldNode) => {
      if (!field) return false;
      return field.name === "Status" && Array.isArray(field.options);
    }) as StatusFieldNode | undefined;

    if (!statusField) {
      return null;
    }

    return statusField.id || null;
  }

  /**
   * Map a column name to a column type
   */
  private mapNameToColumnType(name: string): ColumnType {
    name = name.toLowerCase();
    if (name.includes("todo") || name.includes("to do") || name.includes("to-do")) {
      return ColumnType.TODO;
    }
    if (name.includes("in progress") || name.includes("doing")) {
      return ColumnType.IN_PROGRESS;
    }
    if (name.includes("done") || name.includes("completed")) {
      return ColumnType.DONE;
    }
    if (name.includes("backlog")) {
      return ColumnType.BACKLOG;
    }
    return ColumnType.TODO; // Default to TODO
  }

  /**
   * Get a color for a column type
   */
  private getColorForColumnType(type: ColumnType): ProjectV2SingleSelectFieldOptionColor {
    switch (type) {
      case ColumnType.TODO:
        return ProjectV2SingleSelectFieldOptionColor.BLUE;
      case ColumnType.IN_PROGRESS:
        return ProjectV2SingleSelectFieldOptionColor.YELLOW;
      case ColumnType.DONE:
        return ProjectV2SingleSelectFieldOptionColor.GREEN;
      case ColumnType.BACKLOG:
        return ProjectV2SingleSelectFieldOptionColor.PURPLE;
      default:
        return ProjectV2SingleSelectFieldOptionColor.GRAY;
    }
  }

  /**
   * Update an existing column (status field)
   */
  async updateColumn(
    projectId: string,
    columnId: string,
    name: string,
    options: Array<{
      name: string;
      color: ProjectV2SingleSelectFieldOptionColor;
      description: string;
    }>
  ): Promise<Column | null> {
    try {
      // First, we need to get the actual Status field ID
      const statusFieldId = await this.getStatusFieldId(projectId);
      if (!statusFieldId) {
        console.error("Status field not found in project");
        return null;
      }

      // Now get all current options
      const columns = await this.getColumns(projectId);

      // Create a new options array with all existing options
      const allOptions = columns.map((col) => {
        // If this is the column we're updating, use the new name
        const optName = col.id === columnId ? name : col.name;

        return {
          name: optName,
          color: this.getColorForColumnType(col.type),
          description: "",
        };
      });

      console.log("Status field ID:", statusFieldId);
      console.log("All options to update:", allOptions);

      // Update the Status field with all options (including our updated one)
      const result = await this.client
        .mutation(UpdateColumnDocument, {
          fieldId: statusFieldId,
          options: allOptions,
        })
        .toPromise();

      if (result.error) {
        console.error("Error updating column:", result.error);
        return null;
      }

      // Find our updated column in the response
      const updatedField = result.data?.updateProjectV2Field?.projectV2Field;
      if (!updatedField || !updatedField.options) {
        console.error("No field data returned from update mutation");
        return null;
      }

      const updatedOption = updatedField.options.find((opt) => opt.name === name);
      if (!updatedOption) {
        console.error("Could not find updated column in response");
        return null;
      }

      return {
        id: updatedOption.id,
        name: updatedOption.name,
        type: this.mapNameToColumnType(updatedOption.name),
        options: [updatedOption],
      };
    } catch (error) {
      console.error("Error updating column:", error);
      return null;
    }
  }

  /**
   * Delete a column (status field option)
   */
  async deleteColumn(projectId: string, columnId: string): Promise<boolean> {
    try {
      // We can't actually delete an individual option (column)
      // Instead, we need to update the Status field with all options EXCEPT the one we want to delete

      // First, get the status field ID
      const statusFieldId = await this.getStatusFieldId(projectId);
      if (!statusFieldId) {
        console.error("Status field not found in project");
        return false;
      }

      // Get all existing columns/options
      const existingColumns = await this.getColumns(projectId);

      // Filter out the column we want to delete
      const remainingOptions = existingColumns
        .filter((col) => col.id !== columnId)
        .map((col) => ({
          name: col.name,
          color: this.getColorForColumnType(col.type),
          description: "",
        }));

      // If we have no remaining options, we can't delete the last column
      if (remainingOptions.length === 0) {
        console.error("Cannot delete the last column in a project");
        return false;
      }

      // Update the Status field with the remaining options
      const { data, error } = await this.client
        .mutation(UpdateColumnDocument, {
          fieldId: statusFieldId,
          options: remainingOptions,
        })
        .toPromise();

      if (error) {
        console.error("Error deleting column:", error);
        return false;
      }

      return !!data?.updateProjectV2Field?.projectV2Field;
    } catch (error) {
      console.error("Exception deleting column:", error);
      return false;
    }
  }
}

export const columnService = new ColumnService();

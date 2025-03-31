/**
 * Column Service
 *
 * Service class to handle all column-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { Column, ColumnFormData, ColumnType } from "../../types";
import { client } from "../client";
import { ProjectV2SingleSelectFieldOptionColor as GQLProjectV2SingleSelectFieldOptionColor } from "../generated/graphql";
import {
  AddColumnDocument,
  DeleteColumnDocument,
  UpdateColumnDocument,
} from "../operations/operation-names";

import { appInitializationService } from "./AppInitializationService";

// Type alias for compatibility
type ProjectV2SingleSelectFieldOptionColorType = GQLProjectV2SingleSelectFieldOptionColor;

// Type for field update response
interface SingleSelectField {
  __typename?: "ProjectV2SingleSelectField";
  id: string;
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
   * Get columns for a project - uses only appInitializationService
   */
  async getColumns(projectId: string): Promise<Column[]> {
    return appInitializationService.getProjectColumns(projectId);
  }

  /**
   * Get the Status field ID for a project - uses only appInitializationService
   */
  async getStatusFieldId(projectId: string): Promise<string | null> {
    const columns = appInitializationService.getProjectColumns(projectId);
    if (columns.length > 0) {
      // Find the first column that has a fieldId
      const columnWithFieldId = columns.find((column) => column.fieldId !== undefined);
      if (columnWithFieldId && columnWithFieldId.fieldId) {
        return columnWithFieldId.fieldId;
      }
    }
    return null;
  }

  /**
   * Get a column option ID by name - uses only appInitializationService
   */
  async getColumnOptionId(
    projectId: string,
    statusFieldId: string,
    columnName: string
  ): Promise<string | null> {
    const columns = appInitializationService.getProjectColumns(projectId);
    if (columns.length > 0) {
      // Find the column by name
      const matchingColumn = columns.find(
        (column) => column.name.toLowerCase() === columnName.toLowerCase()
      );
      if (matchingColumn) {
        return matchingColumn.id;
      }
    }
    return null;
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
  private getColorForColumnType(type: ColumnType): GQLProjectV2SingleSelectFieldOptionColor {
    switch (type) {
      case ColumnType.TODO:
        return GQLProjectV2SingleSelectFieldOptionColor.Blue;
      case ColumnType.IN_PROGRESS:
        return GQLProjectV2SingleSelectFieldOptionColor.Yellow;
      case ColumnType.DONE:
        return GQLProjectV2SingleSelectFieldOptionColor.Green;
      case ColumnType.BACKLOG:
        return GQLProjectV2SingleSelectFieldOptionColor.Purple;
      default:
        return GQLProjectV2SingleSelectFieldOptionColor.Gray;
    }
  }

  /**
   * Update an existing column (status field)
   */
  async updateColumn(projectId: string, columnId: string, name: string): Promise<Column | null> {
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
          name: "Status",
          options: allOptions,
        })
        .toPromise();

      if (result.error) {
        console.error("Error updating column:", result.error);
        return null;
      }

      // Find our updated column in the response
      const updatedField = result.data?.updateProjectV2Field?.projectV2Field as SingleSelectField;
      if (!updatedField?.options) {
        console.error("No field data returned from update mutation");
        return null;
      }

      const updatedOption = updatedField.options.find(
        (opt: { id: string; name: string; color?: string }) => opt.name === name
      );
      if (!updatedOption) {
        console.error("Could not find updated column in response");
        return null;
      }

      return {
        id: updatedOption.id,
        name: updatedOption.name,
        type: this.mapNameToColumnType(updatedOption.name),
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
          name: "Status",
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
          name: "Status",
          options: allOptions,
        })
        .toPromise();

      if (error || !data?.updateProjectV2Field?.projectV2Field) {
        console.error("Error creating column:", error);
        return null;
      }

      const field = data.updateProjectV2Field.projectV2Field as SingleSelectField;
      if (!field?.options || field.options.length === 0) {
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
}

export const columnService = new ColumnService();

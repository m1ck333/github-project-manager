import { makeAutoObservable, runInAction } from "mobx";

import { projectRelationsService } from "../services";
import { Column, ColumnFormData } from "../types";

/**
 * Store responsible for project board operations (columns)
 */
export class ProjectBoardStore {
  loading = false;
  error: Error | string | null = null;
  columns: Column[] = [];
  projectId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Set the current project ID
   */
  setProjectId(projectId: string) {
    this.projectId = projectId;
    this.fetchColumns(projectId);
  }

  /**
   * Get columns for a project from local state
   */
  async getProjectColumns(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      // In a real implementation, this would fetch columns from an API
      // For now, just return the current columns that match the project ID
      const columns = this.columns.filter(
        (column) => column.projectId === projectId || !column.projectId
      );

      runInAction(() => {
        this.columns = columns;
        this.loading = false;
      });

      return columns;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  /**
   * Fetch columns for a project
   */
  async fetchColumns(projectId: string) {
    return this.getProjectColumns(projectId);
  }

  /**
   * Add a column to a project
   */
  async addColumn(projectId: string, columnData: ColumnFormData): Promise<Column | null> {
    this.loading = true;
    this.error = null;

    try {
      // Get the status field ID from the existing columns
      const firstColumn = this.columns.find((c) => c.fieldId);
      const statusFieldId = firstColumn?.fieldId || "default-field-id";

      // Use projectRelationsService to add the column
      await projectRelationsService.addColumn(projectId, columnData.name);

      // Since our mutation doesn't return the field ID, we create a simulated column
      const newColumn: Column = {
        id: `column-${Date.now()}`,
        name: columnData.name,
        type: columnData.type,
        fieldId: statusFieldId,
        projectId,
      };

      runInAction(() => {
        this.columns.push(newColumn);
        this.loading = false;
      });

      return newColumn;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      return null;
    }
  }

  /**
   * Set columns directly
   */
  setColumns(columns: Column[]) {
    this.columns = columns;
  }

  /**
   * Clear any error
   */
  clearError() {
    this.error = null;
  }

  /**
   * Set an error in the store, with special handling for rate limit errors
   */
  setError(error: unknown) {
    if (error instanceof Error) {
      // Check if this is a GraphQL error related to rate limiting
      if (
        error.message.includes("API rate limit") ||
        error.message.includes("secondary rate limit")
      ) {
        // Create a dedicated RateLimitError for better handling
        const rateLimitError = new Error("GitHub API rate limit exceeded. Please try again later.");
        rateLimitError.name = "RateLimitError";
        this.error = rateLimitError;
      } else {
        this.error = error;
      }
    } else if (typeof error === "string") {
      if (error.includes("API rate limit") || error.includes("secondary rate limit")) {
        // Create a dedicated RateLimitError for better handling
        const rateLimitError = new Error("GitHub API rate limit exceeded. Please try again later.");
        rateLimitError.name = "RateLimitError";
        this.error = rateLimitError;
      } else {
        this.error = error;
      }
    } else {
      this.error = "An unknown error occurred";
    }
  }
}

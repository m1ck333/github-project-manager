import { makeAutoObservable, runInAction } from "mobx";

import { appInitializationService } from "../../../services/app-init.service";
import { Column, ColumnFormData } from "../../projects/types";
import { projectRelationsService } from "../services";

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
   * Get columns for a project from AppInitializationService
   */
  async getProjectColumns(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      // Get columns from the appInitializationService
      const columns = appInitializationService.getProjectColumns(projectId);

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
  async addColumn(projectId: string, columnData: ColumnFormData) {
    this.loading = true;
    this.error = null;

    try {
      // Get the status field ID from the existing columns
      const columns = appInitializationService.getProjectColumns(projectId);

      // Get the status field ID (from the first column's fieldId)
      const statusFieldId = columns.length > 0 ? columns[0].fieldId : null;

      if (!statusFieldId) {
        throw new Error("Status field not found in project");
      }

      // Update columnData with the projectId
      const enrichedColumnData = { ...columnData, projectId };

      // Use projectRelationsService to add the column
      const newColumn = await projectRelationsService.addColumn(enrichedColumnData, statusFieldId);

      if (!newColumn) {
        throw new Error("Failed to add column");
      }

      // Refresh project data from appInitializationService
      await appInitializationService.getAllInitialData();
      const updatedColumns = appInitializationService.getProjectColumns(projectId);

      // Update the state
      runInAction(() => {
        this.columns = updatedColumns;
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

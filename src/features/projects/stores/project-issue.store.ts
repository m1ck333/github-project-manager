import { makeAutoObservable, runInAction } from "mobx";

import { getCurrentISOString } from "@/common/utils/date.utils";
import { Repositories } from "@/features/repositories";

import { validateAndExecute } from "../../../common/utils/validation.utils";
import { issueService } from "../../issues/services";
import { issueSchema } from "../../issues/validation";
import { labelService } from "../../labels/services";
import { BoardIssue, Label } from "../types";

/**
 * Store responsible for project issue operations
 */
export class ProjectIssueStore {
  loading = false;
  error: Error | string | null = null;
  issues: BoardIssue[] = [];
  issuesVisible = true;
  projectId: string | null = null;
  validationErrors: Record<string, unknown> | null = null;
  // Store columns and labels directly in the store instead of retrieving them from storeAdapter
  columns: Array<{ id: string; name: string; fieldId: string }> = [];
  labels: Label[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Set the current project ID
   */
  setProjectId(projectId: string) {
    this.projectId = projectId;
    this.fetchIssues(projectId);
  }

  /**
   * Clear validation errors
   */
  clearValidationErrors() {
    this.validationErrors = null;
  }

  /**
   * Set columns for the current project
   */
  setColumns(columns: Array<{ id: string; name: string; fieldId: string }>) {
    this.columns = columns;
  }

  /**
   * Set labels for the current project
   */
  setLabels(labels: Label[]) {
    this.labels = labels;
  }

  /**
   * Get project issues using local data
   */
  async getProjectIssues(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      // In a real implementation, this would call a service to fetch data
      // For now, just return the current issues that match the project ID
      const issues = this.issues.filter((issue) => issue.id.includes(projectId));

      // Update the state
      runInAction(() => {
        this.issues = issues;
        this.loading = false;
      });

      return issues;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  /**
   * Fetch issues for a project
   */
  async fetchIssues(projectId: string) {
    return this.getProjectIssues(projectId);
  }

  /**
   * Toggle issue visibility
   */
  toggleIssuesVisibility() {
    this.issuesVisible = !this.issuesVisible;
  }

  /**
   * Create an issue with zod validation
   */
  async createIssue(projectId: string, title: string, description?: string, columnId?: string) {
    const issueDescription = description || "";
    const labelIds: string[] = [];

    return validateAndExecute(
      issueSchema,
      { title, description: issueDescription, labels: labelIds, assignees: [] },
      async (validData) => {
        this.loading = true;
        this.error = null;
        this.clearValidationErrors();

        try {
          this.loading = true;
          this.validationErrors = null;
          this.error = null;

          // Ensure we have current repositories for selection
          await Repositories.services.crud.fetchRepositories();

          // Get available repositories
          const availableRepositories = Repositories.store.repositories;
          if (!availableRepositories.length) {
            throw new Error("No repositories available");
          }

          // Use the first repository as the target
          const repositoryId = availableRepositories[0].id;

          // Create the issue using issueService
          const issueResult = await issueService.createIssue(
            repositoryId,
            validData.title,
            validData.description || ""
          );

          // Simulate adding the issue to a project
          // In a real implementation, this would call a service
          const projectItemId = `project-item-${Date.now()}`;

          // If columnId is provided, update the issue status
          if (columnId) {
            try {
              await this.updateIssueStatus(projectId, projectItemId, columnId);
            } catch (statusError) {
              console.warn("Failed to set initial column:", statusError);
              // Continue anyway, the issue was created successfully
            }
          }

          // Create a BoardIssue object from the response
          const newIssue: BoardIssue = {
            id: projectItemId,
            issueId: issueResult.issueId,
            title: validData.title,
            body: validData.description || "",
            number: issueResult.number,
            status: columnId ? this.getColumnNameById(columnId) : "TODO", // Default status for new issues
            columnId: columnId || "no-status",
            labels: [],
            url: "",
            author: null,
            assignees: [],
            createdAt: getCurrentISOString(),
            updatedAt: getCurrentISOString(),
          };

          // Update the state
          runInAction(() => {
            this.issues.push(newIssue);
            this.loading = false;
          });

          return newIssue;
        } catch (error) {
          runInAction(() => {
            this.setError(error);
            this.loading = false;
          });
          throw error;
        }
      }
    );
  }

  /**
   * Update an issue's status
   */
  async updateIssueStatus(_projectId: string, itemId: string, statusOptionId: string) {
    this.loading = true;
    this.error = null;

    try {
      // Get the status field from local columns
      const statusField = this.columns.length > 0 ? this.columns[0].fieldId : null;

      if (!statusField) {
        throw new Error("Status field not found");
      }

      // Find the status option name
      const column = this.columns.find((col) => col.id === statusOptionId);
      const statusName = column?.name || "TODO";

      // In a real implementation, this would call a service to update the status
      // For now, simulate a successful update
      const success = true;

      // Update the local issue
      runInAction(() => {
        const issueIndex = this.issues.findIndex((i) => i.id === itemId);
        if (issueIndex !== -1) {
          this.issues[issueIndex].status = statusName;
          this.issues[issueIndex].columnId = statusOptionId;
        }

        this.loading = false;
      });

      return success;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      return false;
    }
  }

  /**
   * Delete an issue
   */
  async deleteIssue(_projectId: string, _issueId: string, projectItemId: string): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      // First, optimistically update the UI by removing the issue
      runInAction(() => {
        this.issues = this.issues.filter((issue) => issue.id !== projectItemId);
      });

      // In a real implementation, this would call a service to delete the issue
      // For now, just simulate a successful deletion
      const success = true;

      runInAction(() => {
        this.loading = false;
      });

      return success;
    } catch (error) {
      // Log the error but don't revert the UI changes to avoid confusion
      console.error("Error deleting issue:", error);
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });

      return false;
    }
  }

  /**
   * Update issue labels
   */
  async updateIssueLabels(issueId: string, labelIds: string[]): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      // Filter to only the selected label IDs, or create placeholder labels
      const selectedLabels = labelIds.map((id) => {
        const existingLabel = this.labels.find((label) => label.id === id);
        if (existingLabel) {
          return existingLabel;
        }
        // Create a placeholder if label not found
        return {
          id,
          name: `Label ${id}`,
          color: "#cccccc",
          description: "",
        };
      });

      // Update the issue's labels in local state
      runInAction(() => {
        const issueIndex = this.issues.findIndex((issue) => issue.id === issueId);
        if (issueIndex !== -1) {
          this.issues[issueIndex].labels = selectedLabels;
        }
        this.loading = false;
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      return false;
    }
  }

  /**
   * Create a new label for a project
   */
  async createLabel(_projectId: string, name: string, color: string, description?: string) {
    this.loading = true;
    this.error = null;

    try {
      // Ensure we have current repositories for selection
      await Repositories.services.crud.fetchRepositories();

      // Get available repositories
      const availableRepositories = Repositories.store.repositories;
      if (!availableRepositories.length) {
        throw new Error("No repositories available");
      }

      // Use the first repository
      const repository = availableRepositories[0];

      // Create the label using labelService
      const label = await labelService.createLabel(repository.id, name, color, description);

      // Add the new label to the store's labels
      runInAction(() => {
        this.labels.push(label);
        this.loading = false;
      });

      return label;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  /**
   * Helper method to get column name by ID
   */
  private getColumnNameById(columnId: string): string {
    if (this.projectId === null) return "TODO";

    const column = this.columns.find((col) => col.id === columnId);
    return column?.name || "TODO";
  }

  /**
   * Set issues directly
   */
  setIssues(issues: BoardIssue[]) {
    this.issues = issues;
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

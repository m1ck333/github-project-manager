import { makeAutoObservable, runInAction } from "mobx";

import { validateAndExecute } from "../../../common/utils/validation";
import { appInitializationService } from "../../../services/app-init.service";
import { repositoryStore } from "../../../stores";
import { projectIssueService } from "../services";
import { BoardIssue, Label } from "../types";
import { issueSchema } from "../validation";

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
   * Get project issues from AppInitializationService
   */
  async getProjectIssues(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      // Get issues from the appInitializationService
      const issues = appInitializationService.getProjectIssues(projectId);

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
          // Get a repository for this project from the repositories store
          if (!repositoryStore.repositories.length) {
            await repositoryStore.fetchUserRepositories();
          }

          if (!repositoryStore.repositories.length) {
            throw new Error("No repositories available");
          }

          // Use the first repository as the target
          const repositoryId = repositoryStore.repositories[0].id;

          // Create the issue using projectService
          const issueResult = await projectIssueService.createIssue(
            repositoryId,
            validData.title,
            validData.description || ""
          );

          // Add the issue to the project
          const projectItemId = await projectIssueService.addIssueToProject(
            projectId,
            issueResult.issueId
          );

          // If columnId is provided, update the issue status
          if (columnId) {
            try {
              await this.updateIssueStatus(projectId, projectItemId, columnId);
            } catch (statusError) {
              console.warn("Failed to set initial column:", statusError);
              // Continue anyway, the issue was created successfully
            }
          }

          // Refresh data from appInitializationService
          await appInitializationService.getAllInitialData();

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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
  async updateIssueStatus(projectId: string, itemId: string, statusOptionId: string) {
    this.loading = true;
    this.error = null;

    try {
      // Get the status field from appInitializationService
      const columns = appInitializationService.getProjectColumns(projectId);
      const statusField = columns.length > 0 ? columns[0].fieldId : null;

      if (!statusField) {
        throw new Error("Status field not found");
      }

      // Find the status option name
      const column = columns.find((col) => col.id === statusOptionId);
      const statusName = column?.name || "TODO";

      // Use projectService to update the issue status
      const success = await projectIssueService.updateIssueStatus(
        projectId,
        itemId,
        statusField,
        statusOptionId
      );

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
  async deleteIssue(_projectId: string, issueId: string, projectItemId: string): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      // First, optimistically update the UI by removing the issue
      runInAction(() => {
        this.issues = this.issues.filter((issue) => issue.id !== projectItemId);
      });

      // Use projectService to delete the issue
      await projectIssueService.deleteIssue(issueId);

      // Refresh project data to ensure we're in sync with the server
      await appInitializationService.getAllInitialData();

      runInAction(() => {
        this.loading = false;
      });

      return true;
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
      // Get labels from the selected project
      const projectLabels = appInitializationService.getProjectLabels(this.projectId || "");

      // Filter to only the selected label IDs, or create placeholder labels
      const selectedLabels = labelIds.map((id) => {
        const existingLabel = projectLabels.find((label: Label) => label.id === id);
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
   * Create a label for a repository
   */
  async createLabel(_projectId: string, name: string, color: string, description?: string) {
    this.loading = true;
    this.error = null;

    try {
      // Get a repository for this project
      if (!repositoryStore.repositories.length) {
        await repositoryStore.fetchUserRepositories();
      }

      if (!repositoryStore.repositories.length) {
        throw new Error("No repositories available");
      }

      // Use the first repository as the target
      const repositoryId = repositoryStore.repositories[0].id;

      // Create the label
      const label = await projectIssueService.createLabel(repositoryId, name, color, description);

      // Refresh project data
      await appInitializationService.getAllInitialData();

      this.loading = false;
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

    const columns = appInitializationService.getProjectColumns(this.projectId);
    const column = columns.find((col) => col.id === columnId);
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

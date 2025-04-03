import { makeAutoObservable, runInAction } from "mobx";

import { ColumnFormData, Project, ProjectFormData, BoardIssue } from "../core/types";
import { appInitializationService } from "../services/app-init.service";
import { projectService } from "../services/project.service";
import { projectSchema, issueSchema, labelSchema, validateAndExecute } from "../validation";

import { repositoryStore } from "./index";

/**
 * ProjectStore handles all project-related operations
 * Uses ProjectService for business logic and GraphQL operations
 * Focuses on state management and UI updates
 */
export class ProjectStore {
  projects: Project[] = [];
  loading = false;
  error: Error | string | null = null;
  selectedProject: Project | null = null;
  issuesVisible = true;
  validationErrors: Record<string, unknown> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get columns() {
    return this.selectedProject?.columns || [];
  }

  get issues() {
    return this.selectedProject?.issues || [];
  }

  get currentProject() {
    return this.selectedProject;
  }

  get repositories() {
    return appInitializationService.getRepositories();
  }

  set currentProject(project: Project | null) {
    this.selectedProject = project;
  }

  // Clear validation errors
  clearValidationErrors() {
    this.validationErrors = null;
  }

  /**
   * Fetches projects from the API
   */
  async fetchProjects() {
    this.loading = true;
    this.error = null;

    try {
      const data = await appInitializationService.getAllInitialData();
      runInAction(() => {
        this.projects = data.projects || [];
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
        this.loading = false;
      });
    }
  }

  /**
   * Creates a new project
   */
  async createProject(projectData: ProjectFormData) {
    return validateAndExecute(projectSchema, projectData, async (validData) => {
      this.loading = true;
      this.error = null;
      this.clearValidationErrors();

      try {
        const ownerId = appInitializationService.getUserId();
        if (!ownerId) {
          throw new Error("User ID not found");
        }

        // Use projectService to create the project
        const newProject = await projectService.createProject(validData, ownerId);

        // Get the user data from appInitializationService
        const userData = await appInitializationService.getCurrentUser();

        // Update user information in the project
        if (userData) {
          newProject.createdBy = {
            login: userData.login || "",
            avatarUrl: userData.avatarUrl || "",
          };
          newProject.owner = {
            login: userData.login || "",
            avatarUrl: userData.avatarUrl || "",
          };
        }

        // Refresh data from appInitializationService to ensure consistent state
        await appInitializationService.getAllInitialData();

        // Update the state
        runInAction(() => {
          this.projects.push(newProject);
          this.loading = false;
        });

        return newProject;
      } catch (error) {
        runInAction(() => {
          this.error = error instanceof Error ? error.message : String(error);
          this.loading = false;
        });
        throw error;
      }
    });
  }

  /**
   * Update an existing project with zod validation
   */
  async updateProject(projectId: string, projectData: ProjectFormData) {
    return validateAndExecute(projectSchema, projectData, async (validData) => {
      this.loading = true;
      this.error = null;
      this.clearValidationErrors();

      try {
        // Use projectService to update the project
        const updatedProject = await projectService.updateProject(projectId, validData);

        // Update the state
        runInAction(() => {
          const index = this.projects.findIndex((p) => p.id === projectId);
          if (index !== -1) {
            this.projects[index] = updatedProject;
          }
          this.loading = false;
        });

        return updatedProject;
      } catch (error) {
        runInAction(() => {
          this.setError(error);
          this.loading = false;
        });
        throw error;
      }
    });
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      // Use projectService to delete the project
      const success = await projectService.deleteProject(projectId);

      runInAction(() => {
        if (success) {
          this.projects = this.projects.filter((project) => project.id !== projectId);

          // Clear selected project if it was deleted
          if (this.selectedProject && this.selectedProject.id === projectId) {
            this.selectedProject = null;
          }
        } else {
          this.error = "Failed to delete project";
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
   * Get columns for a project from AppInitializationService
   */
  async getProjectColumns(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      // Get columns from the appInitializationService
      const columns = appInitializationService.getProjectColumns(projectId);

      runInAction(() => {
        const project = this.projects.find((p) => p.id === projectId);
        if (project) {
          project.columns = columns;
        }

        if (this.selectedProject?.id === projectId) {
          this.selectedProject.columns = columns;
        }

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

      // Use projectService to add the column
      const newColumn = await projectService.addColumn(projectId, columnData, statusFieldId);

      if (!newColumn) {
        throw new Error("Failed to add column");
      }

      // Refresh project data from appInitializationService
      await appInitializationService.getAllInitialData();
      const updatedColumns = appInitializationService.getProjectColumns(projectId);

      // Update the state
      runInAction(() => {
        const project = this.projects.find((p) => p.id === projectId);
        if (project) {
          project.columns = updatedColumns;
        }

        if (this.selectedProject?.id === projectId) {
          this.selectedProject.columns = updatedColumns;
        }

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
        const project = this.projects.find((p) => p.id === projectId);
        if (project) {
          project.issues = issues;
        }

        if (this.selectedProject?.id === projectId) {
          this.selectedProject.issues = issues;
        }

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
          const issueResult = await projectService.createIssue(
            repositoryId,
            validData.title,
            validData.description || ""
          );

          // Add the issue to the project
          const projectItemId = await projectService.addIssueToProject(
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
            const project = this.projects.find((p) => p.id === projectId);
            if (project && project.issues) {
              project.issues.push(newIssue);
            }

            if (this.selectedProject?.id === projectId && this.selectedProject.issues) {
              this.selectedProject.issues.push(newIssue);
            }

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
   * Helper method to get column name by ID
   */
  private getColumnNameById(columnId: string): string {
    if (!this.selectedProject?.columns) return "TODO";

    const column = this.selectedProject.columns.find((col) => col.id === columnId);
    return column?.name || "TODO";
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
      const success = await projectService.updateIssueStatus(
        projectId,
        itemId,
        statusField,
        statusOptionId
      );

      // Update the local issue
      runInAction(() => {
        const project = this.projects.find((p) => p.id === projectId);
        if (project && project.issues) {
          const issueIndex = project.issues.findIndex((i) => i.id === itemId);
          if (issueIndex !== -1) {
            project.issues[issueIndex].status = statusName;
          }
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
   * Create a label for a repository with zod validation
   */
  async createLabel(projectId: string, name: string, color: string, description?: string) {
    return validateAndExecute(labelSchema, { name, color, description }, async (validData) => {
      this.loading = true;
      this.error = null;
      this.clearValidationErrors();

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

        // Use projectService to create the label
        const newLabel = await projectService.createLabel(
          repositoryId,
          validData.name,
          validData.color,
          validData.description
        );

        // Refresh data from appInitializationService
        await appInitializationService.getAllInitialData();

        // Update the state
        runInAction(() => {
          const project = this.projects.find((p) => p.id === projectId);
          if (project) {
            if (!project.labels) {
              project.labels = [];
            }
            project.labels.push(newLabel);
          }

          this.loading = false;
        });

        return newLabel;
      } catch (error) {
        runInAction(() => {
          this.setError(error);
          this.loading = false;
        });
        throw error;
      }
    });
  }

  /**
   * Link a repository to a project
   */
  async linkRepositoryToProject(
    projectId: string,
    repositoryOwner: string,
    repositoryName: string
  ): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      // Construct the repository ID
      const repositoryId = `${repositoryOwner}/${repositoryName}`;

      // Use projectService to link the repository
      const success = await projectService.linkRepositoryToProject(projectId, repositoryId);

      // Refresh data from appInitializationService
      await appInitializationService.getAllInitialData();

      // Update the state from the refreshed data
      const updatedProject = appInitializationService.getProjectById(projectId);
      if (updatedProject) {
        runInAction(() => {
          // Find and update the project in our state
          const index = this.projects.findIndex((p) => p.id === projectId);
          if (index !== -1) {
            this.projects[index] = updatedProject;
          }

          // Update selected project if needed
          if (this.selectedProject?.id === projectId) {
            this.selectedProject = updatedProject;
          }

          this.loading = false;
        });
      }

      return success;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      return false;
    }
  }

  // Helper methods
  /**
   * Select a project by ID without triggering a data fetch
   */
  selectProjectWithoutFetch(projectId: string) {
    const project = this.projects.find((p) => p.id === projectId);
    if (project) {
      this.selectedProject = project;
    } else {
      throw new Error(`Project with ID ${projectId} not found`);
    }
  }

  /**
   * Select a project by ID
   */
  selectProject(projectId: string) {
    const project = this.projects.find((p) => p.id === projectId);
    if (project) {
      this.selectedProject = project;

      // Fetch latest data for this project from appInitializationService
      this.fetchProjects().catch((error) => {
        console.error("Error refreshing project data:", error);
      });
    } else {
      throw new Error(`Project with ID ${projectId} not found`);
    }
  }

  /**
   * Clear the selected project
   */
  clearSelectedProject() {
    this.selectedProject = null;
  }

  /**
   * Clear any error
   */
  clearError() {
    this.error = null;
  }

  /**
   * Set projects directly from app initialization data
   */
  setProjects(projects: Project[]) {
    runInAction(() => {
      this.projects = projects;
      this.loading = false;
      this.error = null;
    });
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

  /**
   * Update issue labels
   */
  async updateIssueLabels(issueId: string, labelIds: string[]): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      // For now, we'll just update the local state
      // In a real implementation, this would call a GraphQL mutation
      if (this.selectedProject && this.selectedProject.issues) {
        const issueIndex = this.selectedProject.issues.findIndex((issue) => issue.id === issueId);

        if (issueIndex !== -1) {
          // Get labels from the project, if available
          const projectLabels = this.selectedProject.labels || [];

          // Filter to only the selected label IDs, or create placeholder labels
          const selectedLabels = labelIds.map((id) => {
            const existingLabel = projectLabels.find((label) => label.id === id);
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

          // Update the issue's labels
          runInAction(() => {
            if (this.selectedProject?.issues && issueIndex !== -1) {
              this.selectedProject.issues[issueIndex].labels = selectedLabels;
            }
            this.loading = false;
          });

          return true;
        }
      }

      this.loading = false;
      return false;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      return false;
    }
  }

  /**
   * Delete an issue from a project
   */
  async deleteIssue(projectId: string, issueId: string, projectItemId: string): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      // First, optimistically update the UI by removing the issue
      runInAction(() => {
        // Update the selected project if it matches
        if (this.selectedProject?.id === projectId && this.selectedProject.issues) {
          this.selectedProject.issues = this.selectedProject.issues.filter(
            (issue) => issue.id !== projectItemId
          );
        }

        // Update the projects list
        const projectIndex = this.projects.findIndex((p) => p.id === projectId);
        if (projectIndex !== -1 && this.projects[projectIndex].issues) {
          this.projects[projectIndex].issues = this.projects[projectIndex].issues!.filter(
            (issue) => issue.id !== projectItemId
          );
        }
      });

      // Use projectService to delete the issue
      await projectService.deleteIssue(issueId);

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
}

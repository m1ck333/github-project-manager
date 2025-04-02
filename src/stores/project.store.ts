import { makeAutoObservable, runInAction } from "mobx";

import { client } from "../api/client";
import { ProjectV2SingleSelectFieldOptionColor } from "../api/generated/graphql";
import {
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  LinkRepositoryToProjectDocument,
  AddColumnDocument,
  CreateIssueDocument,
  UpdateIssueStatusDocument,
  CreateLabelDocument,
  AddProjectItemDocument,
  DeleteIssueDocument,
} from "../api/operations/operation-names";
import {
  ColumnFormData,
  Project,
  ProjectFormData,
  BoardIssue,
  Label,
  ColumnType,
} from "../core/types";
import { appInitializationService } from "../services/app-init.service";
import { projectSchema, issueSchema, labelSchema, validateAndExecute } from "../validation";

import { repositoryStore } from "./index";

/**
 * ProjectStore handles all project-related operations
 * This includes projects, issues, labels, columns, and collaborators
 * Mutations use the generated GraphQL hooks from codegen
 * Data fetching is handled by AppInitializationService
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

        const input = {
          ownerId: ownerId,
          title: validData.name,
          ...(validData.description ? { description: validData.description } : {}),
        };

        const { data, error } = await client.mutation(CreateProjectDocument, { input }).toPromise();

        if (error || !data?.createProjectV2?.projectV2) {
          throw new Error(error?.message || "Failed to create project");
        }

        // Get the user data from appInitializationService
        const userData = await appInitializationService.getCurrentUser();

        // Create a well-formed project object from the response
        const newProject: Project = {
          id: data.createProjectV2.projectV2.id,
          name: data.createProjectV2.projectV2.title,
          description: projectData.description || "",
          createdAt: data.createProjectV2.projectV2.createdAt,
          updatedAt: data.createProjectV2.projectV2.updatedAt,
          url: data.createProjectV2.projectV2.url,
          html_url: data.createProjectV2.projectV2.url,
          createdBy: {
            login: userData?.login || "",
            avatarUrl: userData?.avatarUrl || "",
          },
          owner: {
            login: userData?.login || "",
            avatarUrl: userData?.avatarUrl || "",
          },
          columns: [],
          issues: [],
          collaborators: [],
          repositories: [],
        };

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
        const input = {
          projectId: projectId,
          title: validData.name,
          ...(validData.description ? { shortDescription: validData.description } : {}),
        };

        // Use the generated mutation document
        const { data, error } = await client.mutation(UpdateProjectDocument, { input }).toPromise();

        interface UpdateProjectResponse {
          updateProjectV2: {
            projectV2: {
              id: string;
              title: string;
              updatedAt: string;
              url: string;
            };
          };
        }

        const typedData = data as unknown as UpdateProjectResponse;

        if (error || !typedData?.updateProjectV2?.projectV2) {
          throw new Error(error?.message || "Failed to update project");
        }

        const projectData = typedData.updateProjectV2.projectV2;

        // Find the existing project to preserve its relationships
        const existingProject = this.projects.find((p) => p.id === projectId);
        if (!existingProject) {
          throw new Error(`Project with ID ${projectId} not found`);
        }

        // Create an updated project object
        const updatedProject: Project = {
          ...existingProject,
          id: projectData.id,
          name: projectData.title,
          description: projectData.title || "", // Using title as fallback since shortDescription isn't available
          updatedAt: projectData.updatedAt,
          url: projectData.url,
          html_url: projectData.url,
        };

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
      const input = {
        projectId: projectId,
      };

      // Use the generated mutation document
      const { data, error } = await client.mutation(DeleteProjectDocument, { input }).toPromise();

      // The GraphQL mutation returns {data: {deleteProjectV2: {clientMutationId: null}}}
      // which indicates a successful deletion even with null clientMutationId
      const success = error ? false : Boolean(data?.deleteProjectV2);

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

      // Use the generated mutation document
      const { data, error } = await client
        .mutation(AddColumnDocument, {
          fieldId: statusFieldId,
          name: columnData.name,
          color:
            ProjectV2SingleSelectFieldOptionColor[
              this.getColorForColumnType(
                columnData.type
              ) as keyof typeof ProjectV2SingleSelectFieldOptionColor
            ],
        })
        .toPromise();

      if (error || !data) {
        throw new Error(error?.message || "Failed to add column");
      }

      // Refresh project data from appInitializationService
      await appInitializationService.getAllInitialData();
      const updatedColumns = appInitializationService.getProjectColumns(projectId);

      // Find the newly added column by name
      const newColumn = updatedColumns.find((col) => col.name === columnData.name);
      if (!newColumn) {
        throw new Error("Failed to find the new column");
      }

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

          // Create the issue
          const { data, error } = await client
            .mutation(CreateIssueDocument, {
              repositoryId,
              title: validData.title,
              body: validData.description || "",
            })
            .toPromise();

          interface CreateIssueResponse {
            createIssue: {
              issue: {
                id: string;
                number: number;
              };
            };
          }

          const typedIssueData = data as unknown as CreateIssueResponse;

          if (error || !typedIssueData?.createIssue?.issue) {
            throw new Error(error?.message || "Failed to create issue");
          }

          const issueId = typedIssueData.createIssue.issue.id;

          // Add the issue to the project
          const addInput = {
            projectId,
            contentId: issueId,
          };

          // Use the generated document from operation-names
          const { data: addItemData, error: addItemError } = await client
            .mutation(AddProjectItemDocument, { input: addInput })
            .toPromise();

          interface AddItemResponse {
            addProjectV2ItemById: {
              item: {
                id: string;
              };
            };
          }

          const typedAddItemData = addItemData as unknown as AddItemResponse;

          if (addItemError || !typedAddItemData?.addProjectV2ItemById?.item) {
            throw new Error(addItemError?.message || "Failed to add issue to project");
          }

          const projectItemId = typedAddItemData.addProjectV2ItemById.item.id;

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
            issueId,
            title: validData.title,
            body: validData.description || "",
            number: typedIssueData.createIssue.issue.number,
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

      // Use the generated mutation document
      const { data, error } = await client
        .mutation(UpdateIssueStatusDocument, {
          projectId,
          itemId,
          fieldId: statusField,
          valueId: statusOptionId,
        })
        .toPromise();

      interface UpdateIssueStatusResponse {
        updateProjectV2ItemFieldValue: {
          projectV2Item: {
            id: string;
          };
        };
      }

      const typedStatusData = data as unknown as UpdateIssueStatusResponse;

      if (error || !typedStatusData?.updateProjectV2ItemFieldValue?.projectV2Item) {
        throw new Error(error?.message || "Failed to update issue status");
      }

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

        // GitHub expects hex colors without the # prefix
        const colorHex = validData.color.startsWith("#")
          ? validData.color.substring(1)
          : validData.color;

        // Use the generated CreateLabelDocument
        const input = {
          repositoryId,
          name: validData.name,
          color: colorHex,
          description: validData.description || "",
        };

        const { data, error } = await client.mutation(CreateLabelDocument, { input }).toPromise();

        interface CreateLabelResponse {
          createLabel: {
            label: {
              id: string;
              name: string;
              color: string;
              description: string | null;
            };
          };
        }

        const typedLabelData = data as unknown as CreateLabelResponse;

        if (error || !typedLabelData?.createLabel?.label) {
          throw new Error(error?.message || "Failed to create label");
        }

        const labelData = typedLabelData.createLabel.label;
        const newLabel: Label = {
          id: labelData.id,
          name: labelData.name,
          color: `#${labelData.color}`,
          description: labelData.description || "",
        };

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
      const input = {
        projectId,
        repositoryId: `${repositoryOwner}/${repositoryName}`,
      };

      // Use the generated mutation document
      const { data, error } = await client
        .mutation(LinkRepositoryToProjectDocument, { input })
        .toPromise();

      if (error || !data?.linkProjectV2ToRepository) {
        throw new Error(error?.message || "Failed to link repository to project");
      }

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

      return true;
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
   * Helper method to get a color for a column type
   */
  private getColorForColumnType(type: ColumnType): string {
    switch (type) {
      case ColumnType.TODO:
        return "Blue";
      case ColumnType.IN_PROGRESS:
        return "Yellow";
      case ColumnType.DONE:
        return "Green";
      case ColumnType.BACKLOG:
        return "Purple";
      default:
        return "Gray";
    }
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

      // Now perform the actual deletion
      const { error } = await client.mutation(DeleteIssueDocument, { issueId }).toPromise();

      if (error) {
        throw new Error(error.message || "Failed to delete issue");
      }

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

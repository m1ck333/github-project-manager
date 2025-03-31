import { makeAutoObservable, runInAction } from "mobx";

import {
  projectService,
  columnService,
  issueService,
  collaboratorService,
} from "../graphql/services";
import {
  ColumnFormData,
  Project,
  ProjectFormData,
  CollaboratorFormData,
  Collaborator,
  Repository,
} from "../types";

import { repositoryStore } from "./index";

export class ProjectStore {
  projects: Project[] = [];
  loading = false;
  error: Error | string | null = null;
  selectedProject: Project | null = null;
  issuesVisible = true;

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

  set currentProject(project: Project | null) {
    this.selectedProject = project;
  }

  async fetchProjects() {
    this.loading = true;
    this.error = null;

    try {
      const projects = await projectService.getProjects();

      // Set the projects first to show something to the user quickly
      runInAction(() => {
        this.projects = projects.map((project) => ({
          ...project,
          columns: [],
          collaborators: [],
        }));
        this.loading = false;
      });

      return projects;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  async createProject(projectData: ProjectFormData) {
    this.loading = true;
    this.error = null;

    try {
      const newProject = await projectService.createProject(projectData);

      if (newProject) {
        runInAction(() => {
          this.projects.push({
            ...newProject,
            columns: [],
            collaborators: [],
          });
          this.loading = false;
        });
      }

      return newProject;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  async updateProject(projectId: string, projectData: ProjectFormData) {
    this.loading = true;
    this.error = null;

    try {
      const updatedProject = await projectService.updateProject(projectId, projectData);

      if (updatedProject) {
        runInAction(() => {
          const index = this.projects.findIndex((p) => p.id === projectId);
          if (index !== -1) {
            // Preserve columns and collaborators from the existing project
            const existingProject = this.projects[index];
            this.projects[index] = {
              ...updatedProject,
              columns: existingProject.columns || [],
              collaborators: existingProject.collaborators || [],
            };
          }
          this.loading = false;
        });
      }

      return updatedProject;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  async deleteProject(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      const response = await projectService.deleteProject(projectId);

      // The GraphQL mutation returns {data: {deleteProjectV2: {clientMutationId: null}}}
      // which indicates a successful deletion even with null clientMutationId
      const success = typeof response === "boolean" ? response : true;

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

  // Columns management
  async getProjectColumns(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      const columns = await columnService.getColumns(projectId);

      runInAction(() => {
        const project = this.projects.find((p) => p.id === projectId);
        if (project) {
          project.columns = columns;
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

  async addColumn(projectId: string, columnData: ColumnFormData) {
    this.loading = true;
    this.error = null;

    try {
      const project = this.projects.find((p) => p.id === projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      // The new structure requires implementing a mutation to add a status option
      // to the Status field using the columnData
      // This needs to be implemented in ColumnService

      // For now, create a mock column with a temporary ID
      const mockColumn = {
        id: `temp-${Date.now()}`,
        name: columnData.name,
        type: columnData.type,
      };

      // Update the UI optimistically
      runInAction(() => {
        if (!project.columns) {
          project.columns = [];
        }
        project.columns.push(mockColumn);
        this.loading = false;
      });

      // Since we've only updated the UI but not actually created on GitHub,
      // add a warning in the console
      console.warn(
        `Column creation not implemented in the API. Added column ${columnData.name} to UI only.`
      );

      return mockColumn;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  async deleteColumn(projectId: string, columnId: string) {
    this.loading = true;
    this.error = null;

    try {
      const project = this.projects.find((p) => p.id === projectId);
      if (!project || !project.columns) {
        throw new Error("Project or columns not found");
      }

      // The new structure requires implementing a mutation to delete a status option
      // from the Status field using the columnId (which is the option ID)
      // This needs to be implemented in ColumnService

      // For now, just update the UI optimistically
      runInAction(() => {
        project.columns = project.columns!.filter((column) => column.id !== columnId);
        this.loading = false;
      });

      // Since we've only updated the UI but not actually deleted on GitHub,
      // add a warning in the console
      console.warn(
        `Column deletion not implemented in the API. Removed column ${columnId} from UI only.`
      );

      return true;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  // Project items management
  async getProjectIssues(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      const issues = await issueService.getIssues(projectId);

      runInAction(() => {
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

  async createDraftIssue(projectId: string, title: string, body?: string, statusId?: string) {
    this.loading = true;
    this.error = null;

    try {
      // The IssueService.createDraftIssue only accepts projectId, title and body
      const issue = await issueService.createDraftIssue(projectId, title, body);

      // If we have a statusId, update the issue status separately
      if (issue && statusId) {
        // Get the status field ID first
        const fieldId = await this.getStatusFieldId(projectId);
        if (fieldId && issue.projectItemId) {
          await issueService.updateIssueStatus(projectId, issue.projectItemId, fieldId, statusId);
        }
      }

      runInAction(() => {
        this.loading = false;
      });

      return issue;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  async updateIssueStatus(projectId: string, itemId: string, statusOptionId: string) {
    this.loading = true;
    this.error = null;

    try {
      // Get the status field ID first
      const fieldId = await this.getStatusFieldId(projectId);
      if (!fieldId) {
        throw new Error("Status field not found");
      }

      // Updated to match the signature in IssueService
      const success = await issueService.updateIssueStatus(
        projectId,
        itemId,
        fieldId,
        statusOptionId
      );

      runInAction(() => {
        this.loading = false;
      });

      return success;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  // Helper method to get the status field ID
  private async getStatusFieldId(projectId: string): Promise<string | null> {
    try {
      // Using the public method from issueService
      const fieldId = await issueService.getStatusFieldId(projectId);
      return fieldId;
    } catch (error) {
      console.error("Error getting status field ID:", error);
      return null;
    }
  }

  selectProject(projectId: string) {
    const project = this.projects.find((p) => p.id === projectId);
    if (project) {
      this.selectedProject = project;
    } else {
      this.error = "Project not found";
    }
  }

  clearSelectedProject() {
    this.selectedProject = null;
  }

  clearError() {
    this.error = null;
  }

  async createIssue(
    projectId: string,
    title: string,
    description: string,
    _labelIds: string[] = []
  ) {
    this.loading = true;
    this.error = null;

    try {
      // Create the draft issue first
      const issue = await this.createDraftIssue(projectId, title, description);

      // Add labels if needed (this would require additional implementation)
      // For now, just returning the created issue

      runInAction(() => {
        this.loading = false;
      });

      return issue;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  async createLabel(_projectId: string, name: string, color: string, description?: string) {
    this.loading = true;
    this.error = null;

    try {
      // Mock implementation - replace with actual API call when available
      const label = {
        id: `label-${Date.now()}`,
        name,
        color,
        description: description || "",
      };

      runInAction(() => {
        // In a real implementation, you would update the label list in the project
        this.loading = false;
      });

      console.warn("Label creation is not fully implemented. Created label for UI only.");
      return label;
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  async addCollaborator(projectId: string, collaboratorData: CollaboratorFormData) {
    this.loading = true;
    this.error = null;

    try {
      const project = this.projects.find((p) => p.id === projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      // Call the CollaboratorService to add the collaborator via GraphQL API
      const success = await collaboratorService.addProjectCollaborator(projectId, collaboratorData);

      // If the API call was successful, create the collaborator object for the UI
      if (success) {
        const mockCollaborator: Collaborator = {
          id: `temp-${Date.now()}`,
          username: collaboratorData.username,
          avatar: `https://avatars.githubusercontent.com/${collaboratorData.username}`,
          role: collaboratorData.role,
        };

        // Update the UI
        runInAction(() => {
          if (!project.collaborators) {
            project.collaborators = [];
          }
          project.collaborators.push(mockCollaborator);
          this.loading = false;
        });

        return mockCollaborator;
      } else {
        throw new Error("Failed to add collaborator via API");
      }
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  async removeCollaborator(projectId: string, collaboratorId: string) {
    this.loading = true;
    this.error = null;

    try {
      const project = this.projects.find((p) => p.id === projectId);
      if (!project || !project.collaborators) {
        throw new Error("Project or collaborators not found");
      }

      // Find the collaborator in our store to get their username
      const collaborator = project.collaborators.find((c) => c.id === collaboratorId);
      if (!collaborator) {
        throw new Error("Collaborator not found in project");
      }

      // Pass the username to the service for lookup
      const success = await collaboratorService.removeProjectCollaborator(
        projectId,
        collaborator.username
      );

      if (success) {
        // Update the UI
        runInAction(() => {
          project.collaborators = project.collaborators!.filter(
            (collaborator) => collaborator.id !== collaboratorId
          );
          this.loading = false;
        });

        return true;
      } else {
        throw new Error("Failed to remove collaborator via API");
      }
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      throw error;
    }
  }

  // Repository integration
  async linkRepositoryToProject(
    projectId: string,
    repositoryOwner: string,
    repositoryName: string
  ): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      // Find the project
      const project = this.projects.find((p) => p.id === projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      // Check if repository exists in repository store
      let repository: Repository | undefined = repositoryStore.repositories.find(
        (r) => r.owner.login === repositoryOwner && r.name === repositoryName
      );

      // If not found, fetch it
      if (!repository) {
        repository = await repositoryStore.fetchRepository(repositoryOwner, repositoryName);
      }

      if (!repository) {
        throw new Error("Repository not found");
      }

      // Link the repository using the updated ProjectService
      const success = await projectService.linkRepositoryToProject(
        projectId,
        repositoryOwner,
        repositoryName
      );

      if (success) {
        // Update local state
        runInAction(() => {
          if (!project.repositories) {
            project.repositories = [];
          }

          // Check if already linked
          const alreadyLinked = project.repositories.some(
            (r) =>
              r.id === repository?.id ||
              (r.owner?.login === repositoryOwner && r.name === repositoryName)
          );

          if (!alreadyLinked && repository) {
            project.repositories.push(repository);
          }
        });

        // Force a refresh of projects to ensure consistency with server
        await this.fetchProjects();
      }

      runInAction(() => {
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

  async unlinkRepositoryFromProject(projectId: string, repositoryId: string) {
    this.loading = true;
    this.error = null;

    try {
      // Find the project
      const project = this.projects.find((p) => p.id === projectId);
      if (!project || !project.repositories) {
        throw new Error(`Project with ID ${projectId} not found or has no repositories`);
      }

      // Remove the repository from the project
      runInAction(() => {
        project.repositories = project.repositories!.filter((r) => r.id !== repositoryId);
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

  async getProjectRepositories(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      // Find the project
      const project = this.projects.find((p) => p.id === projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // In a real implementation, you would fetch the repositories from the API
      // For this example, we'll just return what's already in the project
      runInAction(() => {
        this.loading = false;
      });

      return project.repositories || [];
    } catch (error) {
      runInAction(() => {
        this.setError(error);
        this.loading = false;
      });
      return [];
    }
  }

  /**
   * Set projects directly from app initialization data
   * This allows us to directly populate the projects from a single query
   * rather than making multiple individual queries
   */
  setProjects(projects: Project[]) {
    this.projects = projects;
    this.loading = false;
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

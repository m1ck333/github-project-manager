import { makeAutoObservable, runInAction } from "mobx";
import { ColumnFormData, Project, ProjectFormData } from "../types";
import { projectService, columnService, issueService } from "../graphql/services";

export class ProjectStore {
  projects: Project[] = [];
  loading = false;
  error: string | null = null;
  selectedProject: Project | null = null;

  constructor() {
    makeAutoObservable(this);
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
        this.error = (error as Error).message;
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
        this.error = (error as Error).message;
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
        this.error = (error as Error).message;
        this.loading = false;
      });
      throw error;
    }
  }

  async deleteProject(projectId: string) {
    this.loading = true;
    this.error = null;

    try {
      const success = await projectService.deleteProject(projectId);

      if (success) {
        runInAction(() => {
          this.projects = this.projects.filter((project) => project.id !== projectId);

          // Clear selected project if it was deleted
          if (this.selectedProject && this.selectedProject.id === projectId) {
            this.selectedProject = null;
          }

          this.loading = false;
        });
      }
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
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
        this.error = (error as Error).message;
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
        this.error = (error as Error).message;
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
        this.error = (error as Error).message;
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
        this.error = (error as Error).message;
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
        this.error = (error as Error).message;
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
        this.error = (error as Error).message;
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
    this.selectedProject = this.projects.find((p) => p.id === projectId) || null;
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
    labelIds: string[] = []
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
        this.error = (error as Error).message;
        this.loading = false;
      });
      throw error;
    }
  }
}

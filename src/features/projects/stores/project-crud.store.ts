import { makeAutoObservable, runInAction } from "mobx";

import { validateAndExecute } from "../../../common/utils/validation";
import { appInitializationService } from "../../../services/app-init.service";
import { projectCrudService } from "../services";
import { Project, ProjectFormData } from "../types";
import { projectSchema } from "../validation";

/**
 * Store responsible for project CRUD operations
 */
export class ProjectCrudStore {
  projects: Project[] = [];
  loading = false;
  error: Error | string | null = null;
  selectedProject: Project | null = null;
  validationErrors: Record<string, unknown> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get currentProject() {
    return this.selectedProject;
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
        const newProject = await projectCrudService.createProject(validData, ownerId);

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
        const updatedProject = await projectCrudService.updateProject(projectId, validData);

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
      const success = await projectCrudService.deleteProject(projectId);

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
}

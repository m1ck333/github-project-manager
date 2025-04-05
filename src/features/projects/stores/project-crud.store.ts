import { makeAutoObservable, runInAction } from "mobx";

import { executeGitHubMutation } from "@/api-github";
import { CreateProjectDocument } from "@/api-github/generated/graphql";

import { Project, ProjectFormData } from "../types";
import { projectSchema } from "../validation";

/**
 * Store responsible for project CRUD operations
 */
export class ProjectCrudStore {
  projects: Project[] = [];
  loading = false;
  error: Error | null = null;
  currentProject: Project | null = null;
  // Mock user data for a more realistic implementation
  userData = {
    id: "user-1",
    login: "default-user",
    avatarUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
  };

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Set projects directly (used by the app initialization service)
   */
  setProjects(projects: Project[]) {
    this.projects = projects;
  }

  /**
   * Get all projects
   */
  getProjects(): Project[] {
    return this.projects;
  }

  /**
   * Refresh projects from API
   */
  async fetchProjects() {
    this.loading = true;
    this.error = null;

    try {
      // In a real implementation, this would call an API service
      // For now, we just return the projects we already have in local state
      const projects = this.projects;

      // Update state
      runInAction(() => {
        this.projects = projects;
        this.loading = false;
      });

      return projects;
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
        this.loading = false;
      });
      return [];
    }
  }

  /**
   * Create a new project
   */
  async createProject(formData: ProjectFormData): Promise<Project | null> {
    // Validate form data
    const validationResult = projectSchema.safeParse(formData);
    if (!validationResult.success) {
      // If validation failed, set the error and return null
      const error = new Error(validationResult.error.message);
      this.error = error;
      return null;
    }

    this.loading = true;
    this.error = null;

    try {
      // Get current user ID to set as the owner
      const ownerId = this.userData.id;

      // Get the user data
      const userData = this.userData;

      // Call the GraphQL mutation
      const { data, error } = await executeGitHubMutation(CreateProjectDocument, {
        input: {
          ownerId: ownerId,
          title: formData.name,
          repositoryId: formData.repositoryIds?.[0],
          // Optional fields
          description: formData.description || "",
        },
      });

      if (error || !data?.createProjectV2) {
        throw error || new Error("Failed to create project");
      }

      // Get the created project from the result
      const createdProject = data.createProjectV2.projectV2;

      if (!createdProject) {
        throw new Error("Failed to create project");
      }

      // Create a new project object with the required fields
      const newProject: Project = {
        id: createdProject.id,
        name: createdProject.title,
        description: formData.description || undefined,
        number: createdProject.number,
        url: createdProject.url,
        createdAt: createdProject.createdAt,
        updatedAt: createdProject.updatedAt,
        owner: {
          login: userData.login,
          avatarUrl: userData.avatarUrl,
        },
      };

      // Add the new project to the list
      runInAction(() => {
        this.projects = [...this.projects, newProject];
        this.currentProject = newProject;
        this.loading = false;
      });

      return newProject;
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
        this.loading = false;
      });
      return null;
    }
  }

  /**
   * Get a project by its ID
   */
  getProjectById(id: string): Project | undefined {
    return this.projects.find((project) => project.id === id);
  }

  /**
   * Set the current project
   */
  setCurrentProject(project: Project | null) {
    this.currentProject = project;
  }

  /**
   * Load a project by its ID
   */
  async loadProject(id: string): Promise<Project | null> {
    this.loading = true;
    this.error = null;

    try {
      // Try to find the project in the current list
      let project = this.getProjectById(id);

      if (!project) {
        // If not found, fetch all projects and try again
        await this.fetchProjects();
        project = this.getProjectById(id);

        if (!project) {
          throw new Error(`Project with ID ${id} not found`);
        }
      }

      runInAction(() => {
        this.currentProject = project || null;
        this.loading = false;
      });

      return project || null;
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
        this.loading = false;
      });
      return null;
    }
  }

  /**
   * Clear the current error
   */
  clearError() {
    this.error = null;
  }
}

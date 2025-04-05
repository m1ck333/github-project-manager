import { executeGitHubMutation } from "@/api-github";

import { CreateProjectDocument, UpdateProjectDocument, DeleteProjectDocument } from "../api";

import type { Project, ProjectFormData } from "../types";

/**
 * Service responsible for project CRUD operations
 */
export class ProjectCrudService {
  private projects: Project[] = [];

  /**
   * Get all projects
   */
  getProjects(): Project[] {
    return this.projects;
  }

  /**
   * Find a project by ID
   */
  getProjectById(id: string): Project | undefined {
    return this.projects.find((project) => project.id === id);
  }

  /**
   * Set projects directly
   */
  setProjects(projects: Project[]): void {
    this.projects = projects;
  }

  /**
   * Create a new project
   */
  async createProject(projectData: ProjectFormData, ownerId: string): Promise<Project> {
    const input = {
      ownerId: ownerId,
      title: projectData.name,
      ...(projectData.description ? { description: projectData.description } : {}),
    };

    const { data, error } = await executeGitHubMutation(CreateProjectDocument, { input });

    if (error || !data?.createProjectV2?.projectV2) {
      throw error || new Error("Failed to create project");
    }

    // Return project from the response
    const projectResponse = data.createProjectV2.projectV2;

    // Create a well-formed project object
    const newProject: Project = {
      id: projectResponse.id,
      name: projectResponse.title,
      description: projectData.description || "",
      createdAt: projectResponse.createdAt,
      updatedAt: projectResponse.updatedAt,
      url: projectResponse.url,
      html_url: projectResponse.url,
      createdBy: {
        login: "", // This will be filled in by the store
        avatarUrl: "",
      },
      owner: {
        login: "", // This will be filled in by the store
        avatarUrl: "",
      },
      columns: [],
      issues: [],
      collaborators: [],
      repositories: [],
    };

    return newProject;
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId: string, projectData: ProjectFormData): Promise<Project> {
    const input = {
      projectId: projectId,
      title: projectData.name,
      ...(projectData.description ? { shortDescription: projectData.description } : {}),
    };

    const { data, error } = await executeGitHubMutation(UpdateProjectDocument, { input });

    if (error || !data?.updateProjectV2?.projectV2) {
      throw error || new Error("Failed to update project");
    }

    const projectResponse = data.updateProjectV2.projectV2;

    // Find the existing project to maintain its relationships
    const existingProject = this.getProjectById(projectId);
    if (!existingProject) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Create an updated project object
    const updatedProject: Project = {
      ...existingProject,
      id: projectResponse.id,
      name: projectResponse.title,
      updatedAt: projectResponse.updatedAt,
      url: projectResponse.url,
      html_url: projectResponse.url,
    };

    return updatedProject;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<boolean> {
    const input = { projectId };

    const { data, error } = await executeGitHubMutation(DeleteProjectDocument, { input });

    if (error) {
      throw error;
    }

    return Boolean(data?.deleteProjectV2);
  }

  /**
   * Create a new project (implements abstract method)
   * For direct creation without GitHub API
   */
  create(_projectData: Omit<Project, "id">): Project {
    // In a real implementation, we might generate a temporary ID
    // or call an API. For this example, we'll throw an error and
    // recommend using the createProject method instead.
    throw new Error("Use createProject method to create projects with GitHub API");
  }
}

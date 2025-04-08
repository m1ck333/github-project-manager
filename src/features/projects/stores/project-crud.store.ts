import { action, makeObservable } from "mobx";

import { AbstractEntityStore } from "@/common/stores";
import { userStore } from "@/features/user/stores";

import { projectCrudService } from "../services";
import { projectSchema } from "../validation/project.schema";

import { ProjectStateManager } from "./project-state";

import type { Project, ProjectFormData } from "../types";

/**
 * Handles CRUD operations for projects
 */
export class ProjectCrudStore extends AbstractEntityStore {
  constructor(private stateManager: ProjectStateManager) {
    super();
    makeObservable(this);
  }

  /**
   * Fetch all projects
   */
  @action
  async fetchProjects(forceRefresh = false): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    const result = await projectCrudService.fetchProjects(forceRefresh);

    if (result.success && result.data) {
      this.stateManager.setProjects(result.data);
    } else if (result.error) {
      this.setError(result.error);
    }

    this.setLoading(false);
    return result.success;
  }

  /**
   * Create a new project
   */
  @action
  async createProject(projectData: ProjectFormData): Promise<Project | null> {
    if (!projectData.name) {
      this.setError(new Error("Project name is required"));
      return null;
    }

    const validatedData = projectSchema.parse(projectData);
    this.setLoading(true);
    this.setError(null);

    // Get user ID from store
    const userId = userStore.profile?.id || "user-1";

    const result = await projectCrudService.createProject(validatedData, userId);

    if (result.success && result.data) {
      this.stateManager.addProject(result.data);
      this.setLoading(false);
      return result.data;
    } else if (result.error) {
      this.setError(result.error);
    }

    this.setLoading(false);
    return null;
  }

  /**
   * Update a project
   */
  @action
  async updateProject(
    projectId: string,
    projectData: Partial<ProjectFormData>
  ): Promise<Project | null> {
    const validatedData = projectData as ProjectFormData;
    this.setLoading(true);
    this.setError(null);

    const result = await projectCrudService.updateProject(projectId, validatedData);

    if (result.success && result.data) {
      this.stateManager.updateProject(projectId, result.data);
      return result.data;
    } else if (result.error) {
      this.setError(result.error);
    }

    this.setLoading(false);
    return null;
  }

  /**
   * Delete a project
   */
  @action
  async deleteProject(projectId: string): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    const result = await projectCrudService.deleteProject(projectId);

    if (result.success) {
      this.stateManager.removeProject(projectId);
      if (this.stateManager.selectedProject?.id === projectId) {
        this.stateManager.clearSelectedProject();
      }
    } else if (result.error) {
      this.setError(result.error);
    }

    this.setLoading(false);
    return result.success;
  }

  /**
   * Reset store
   */
  reset(): void {
    super.reset();
  }
}

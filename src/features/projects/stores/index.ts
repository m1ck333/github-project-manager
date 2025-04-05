import { makeObservable, computed, action } from "mobx";

import { getCurrentISOString } from "@/common/utils/date.utils";
import { appInitService } from "@/features/app/services/app-init.service";

import { Project, ProjectFormData } from "../types";

import { ProjectBoardStore } from "./project-board.store";
import { ProjectCrudStore } from "./project-crud.store";
import { ProjectIssueStore } from "./project-issue.store";

// Create singleton instances
export const projectCrudStore = new ProjectCrudStore();
export const projectBoardStore = new ProjectBoardStore();
export const projectIssueStore = new ProjectIssueStore();

// Combined project store with typed access to all store properties
export class ProjectStore {
  crud = projectCrudStore;
  board = projectBoardStore;
  issues = projectIssueStore;

  constructor() {
    // Use makeObservable with explicit decorations instead of makeAutoObservable
    makeObservable(this, {
      // Getters
      loading: computed,
      error: computed,
      currentProject: computed,
      projects: computed,
      selectedProject: computed,
      columns: computed,
      repositories: computed,
      // Actions
      selectProjectWithoutFetch: action,
      selectProject: action,
      clearSelectedProject: action,
      setCurrentProject: action, // Use this instead of string notation for setter
    });
  }

  // Proxy for common properties
  get loading() {
    return this.crud.loading || this.board.loading || this.issues.loading;
  }

  get error() {
    return this.crud.error || this.board.error || this.issues.error;
  }

  get currentProject() {
    return this.crud.currentProject;
  }

  // For backward compatibility with old code
  get projects() {
    return this.crud.projects;
  }

  // Backward compatibility for selectedProject
  get selectedProject() {
    return this.crud.currentProject;
  }

  get columns() {
    return this.board.columns;
  }

  get repositories() {
    return appInitService.getRepositories();
  }

  // Compatibility method proxies
  async fetchProjects() {
    return this.crud.fetchProjects();
  }

  async createProject(projectData: ProjectFormData) {
    return this.crud.createProject(projectData);
  }

  async updateProject(projectId: string, projectData: ProjectFormData) {
    if (!projectId || !this.crud.getProjectById(projectId)) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Just modify the project in-memory since we don't have a proper update method
    const existingProject = this.crud.getProjectById(projectId);
    if (existingProject) {
      existingProject.name = projectData.name;
      if (projectData.description) {
        existingProject.description = projectData.description;
      }
      existingProject.updatedAt = getCurrentISOString();
      return existingProject;
    }
    return null;
  }

  async deleteProject(projectId: string) {
    // Remove the project from memory
    const projectIndex = this.crud.projects.findIndex((p) => p.id === projectId);
    if (projectIndex >= 0) {
      this.crud.projects.splice(projectIndex, 1);
      return true;
    }
    return false;
  }

  async createIssue(projectId: string, title: string, description?: string, columnId?: string) {
    return this.issues.createIssue(projectId, title, description, columnId);
  }

  async updateIssueStatus(projectId: string, itemId: string, statusOptionId: string) {
    return this.issues.updateIssueStatus(projectId, itemId, statusOptionId);
  }

  async updateIssueLabels(issueId: string, labelIds: string[]) {
    return this.issues.updateIssueLabels(issueId, labelIds);
  }

  async deleteIssue(projectId: string, issueId: string, projectItemId: string) {
    return this.issues.deleteIssue(projectId, issueId, projectItemId);
  }

  async createLabel(projectId: string, name: string, color: string, description?: string) {
    return this.issues.createLabel(projectId, name, color, description);
  }

  // Method to link a repository to a project
  async linkRepositoryToProject(
    _projectId: string,
    _repositoryOwner: string,
    _repositoryName: string
  ) {
    this.crud.loading = true;
    this.crud.error = null;

    try {
      // Link repository functionality here
      // For now, just return false to indicate not implemented
      console.warn("linkRepositoryToProject not fully implemented in feature store");
      this.crud.loading = false;
      return false;
    } catch (error) {
      // Set error directly
      this.crud.error = error instanceof Error ? error : new Error(String(error));
      this.crud.loading = false;
      return false;
    }
  }

  // Select a project without fetching additional data
  selectProjectWithoutFetch(projectId: string) {
    const project = this.crud.getProjectById(projectId);
    if (project) {
      this.crud.currentProject = project;
      this.board.setProjectId(projectId);
      this.issues.setProjectId(projectId);
    }
  }

  // Select a project and load its data
  selectProject(projectId: string) {
    // Load the project
    const project = this.crud.getProjectById(projectId);
    if (project) {
      this.crud.currentProject = project;
      this.board.setProjectId(projectId);
      this.issues.setProjectId(projectId);
    } else {
      this.fetchProjects().then(() => {
        const project = this.crud.getProjectById(projectId);
        if (project) {
          this.crud.currentProject = project;
          this.board.setProjectId(projectId);
          this.issues.setProjectId(projectId);
        }
      });
    }
  }

  // Clear the selected project
  clearSelectedProject() {
    this.crud.currentProject = null;
  }

  // Clear errors across all stores
  clearError() {
    this.crud.clearError();
    this.board.clearError();
    this.issues.clearError();
  }

  // For compatibility with old code that directly sets currentProject
  set currentProject(project: Project | null) {
    this.setCurrentProject(project);
  }

  // Add this method to handle currentProject setting
  setCurrentProject(project: Project | null) {
    if (project) {
      this.crud.currentProject = project;
      this.board.setProjectId(project.id);
      this.issues.setProjectId(project.id);
    } else {
      this.clearSelectedProject();
    }
  }

  /**
   * Handle errors across all stores
   */
  handleError(error: unknown) {
    this.board.setError(error);
    this.issues.setError(error);
    // Set error directly
    this.crud.error = error instanceof Error ? error : new Error(String(error));
  }
}

// Export singleton instance of the combined store
export const projectStore = new ProjectStore();

// Export store classes for testing
export { ProjectCrudStore, ProjectBoardStore, ProjectIssueStore };

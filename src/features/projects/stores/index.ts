import { appInitializationService } from "../../../services/app-init.service";
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

  get selectedProject() {
    return this.crud.selectedProject;
  }

  get columns() {
    return this.board.columns;
  }

  get repositories() {
    return appInitializationService.getRepositories();
  }

  // Compatibility method proxies
  async fetchProjects() {
    return this.crud.fetchProjects();
  }

  async createProject(projectData: ProjectFormData) {
    return this.crud.createProject(projectData);
  }

  async updateProject(projectId: string, projectData: ProjectFormData) {
    return this.crud.updateProject(projectId, projectData);
  }

  async deleteProject(projectId: string) {
    return this.crud.deleteProject(projectId);
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

  // Method to link a repository to a project - proxied to projectRepositoryStore
  async linkRepositoryToProject(
    _projectId: string,
    _repositoryOwner: string,
    _repositoryName: string
  ) {
    // Instead of using crud store directly, implement the functionality here
    this.crud.loading = true;
    this.crud.error = null;

    try {
      // Link repository functionality here
      // For now, just return false to indicate not implemented
      console.warn("linkRepositoryToProject not fully implemented in feature store");
      this.crud.loading = false;
      return false;
    } catch (error) {
      this.crud.setError(error);
      this.crud.loading = false;
      return false;
    }
  }

  selectProjectWithoutFetch(projectId: string) {
    this.crud.selectProjectWithoutFetch(projectId);
    this.board.setProjectId(projectId);
    this.issues.setProjectId(projectId);
  }

  // Convenience proxy methods
  selectProject(projectId: string) {
    this.crud.selectProject(projectId);
    this.board.setProjectId(projectId);
    this.issues.setProjectId(projectId);
  }

  clearSelectedProject() {
    this.crud.clearSelectedProject();
  }

  clearError() {
    this.crud.clearError();
    this.board.clearError();
    this.issues.clearError();
  }

  // For compatibility with old code that directly sets currentProject
  set currentProject(project: Project | null) {
    if (project) {
      this.crud.selectProjectWithoutFetch(project.id);
      this.board.setProjectId(project.id);
      this.issues.setProjectId(project.id);
    } else {
      this.clearSelectedProject();
    }
  }
}

// Export singleton instance of the combined store
export const projectStore = new ProjectStore();

// Export store classes for testing
export { ProjectCrudStore, ProjectBoardStore, ProjectIssueStore };

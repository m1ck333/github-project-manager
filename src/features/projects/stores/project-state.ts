import { makeAutoObservable } from "mobx";

import { Project } from "../types";

/**
 * State interface for ProjectStateManager
 */
export interface ProjectState {
  projects: Project[];
  selectedProject?: Project;
}

/**
 * Manages project state for the ProjectStore
 */
export class ProjectStateManager {
  private _projects: Project[] = [];
  private _selectedProject?: Project;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Get all projects
   */
  get projects(): Project[] {
    return this._projects;
  }

  /**
   * Get the currently selected project
   */
  get selectedProject(): Project | undefined {
    return this._selectedProject;
  }

  /**
   * Set projects
   */
  setProjects(projects: Project[]): void {
    this._projects = projects;
  }

  /**
   * Add a project
   */
  addProject(project: Project): void {
    this._projects = [...this._projects, project];
  }

  /**
   * Remove a project
   */
  removeProject(projectId: string): void {
    this._projects = this._projects.filter((project) => project.id !== projectId);
  }

  /**
   * Update a project
   */
  updateProject(projectId: string, updatedProject: Partial<Project>): void {
    this._projects = this._projects.map((project) =>
      project.id === projectId ? { ...project, ...updatedProject } : project
    );
  }

  /**
   * Select a project
   */
  selectProject(projectId: string): void {
    this._selectedProject = this._projects.find((project) => project.id === projectId);
  }

  /**
   * Clear selected project
   */
  clearSelectedProject(): void {
    this._selectedProject = undefined;
  }

  /**
   * Get a project by ID
   */
  getProjectById(projectId: string): Project | undefined {
    return this._projects.find((p) => p.id === projectId);
  }

  /**
   * Reset state
   */
  reset(): void {
    this._projects = [];
    this._selectedProject = undefined;
  }
}

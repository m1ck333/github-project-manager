import { makeObservable, observable } from "mobx";

import { ProjectCrudStore } from "./project-crud.store";
import { ProjectRelatedStore } from "./project-related.store";
import { ProjectSearchStore } from "./project-search.store";
import { ProjectStateManager } from "./project-state";

import type { Project } from "../types";

/**
 * Main Project Store that uses composition
 * to organize functionality into specialized stores
 */
export class ProjectStore {
  @observable private stateManager: ProjectStateManager;

  // Specialized stores using composition
  readonly crud: ProjectCrudStore;
  readonly search: ProjectSearchStore;
  readonly related: ProjectRelatedStore;

  constructor() {
    // Create shared state manager
    this.stateManager = new ProjectStateManager();

    // Initialize specialized stores with the shared state manager
    this.crud = new ProjectCrudStore(this.stateManager);
    this.search = new ProjectSearchStore(this.stateManager);
    this.related = new ProjectRelatedStore(this.stateManager);

    makeObservable(this);
  }

  // State getters
  get projects(): Project[] {
    return this.stateManager.projects;
  }

  get selectedProject(): Project | undefined {
    return this.stateManager.selectedProject;
  }

  // Loading state from any store
  get isLoading(): boolean {
    return this.crud.isLoading || this.search.isLoading || this.related.isLoading;
  }

  // Error state from any store
  get error(): Error | null {
    return this.crud.error || this.search.error || this.related.error;
  }

  // Methods directly forwarded to crud store
  async fetchProjects(forceRefresh = false): Promise<boolean> {
    return this.crud.fetchProjects(forceRefresh);
  }

  getProjectById(projectId: string): Project | undefined {
    return this.stateManager.getProjectById(projectId);
  }

  // Selection methods forwarded to state manager
  selectProject(projectId: string): void {
    this.stateManager.selectProject(projectId);
  }

  clearSelectedProject(): void {
    this.stateManager.clearSelectedProject();
  }

  // Reset all stores
  reset(): void {
    this.crud.reset();
    this.search.reset();
    this.related.reset();
    this.stateManager.reset();
  }
}

// Create a singleton instance
export const projectStore = new ProjectStore();

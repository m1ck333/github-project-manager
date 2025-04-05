import { makeAutoObservable, computed } from "mobx";

import { SearchCriteria } from "@/common/stores";

import { Repository, RepositoryCollaborator } from "../types/repository";

import { repositoryCollaboratorStore } from "./repository-collaborator.store";
import { repositoryCrudStore } from "./repository-crud.store";
import { repositorySearchStore } from "./repository-search.store";

/**
 * Main repository store that combines CRUD, search and collaborator functionality
 */
export class RepositoryStore {
  constructor() {
    makeAutoObservable(this, {
      isLoading: computed,
      repositories: computed,
    });
  }

  /**
   * Get loading state from sub-stores
   */
  get isLoading() {
    return this.crud.isLoading || this.collaborator.loading;
  }

  /**
   * Get error state from sub-stores
   */
  get error() {
    return this.crud.error || this.collaborator.error || null;
  }

  /**
   * Get all repositories
   */
  get repositories() {
    return this.crud.items;
  }

  /**
   * Get the currently selected repository
   */
  get selectedRepository() {
    return this.crud.selectedRepository;
  }

  /**
   * Get all repositories with collaborators
   */
  get repositoriesWithCollaborators() {
    return this.repositories.filter((repo: Repository) => {
      // Don't immediately await the promise - just check if it has collaborators
      const collaborators = repo.collaborators;
      return collaborators && collaborators.length > 0;
    });
  }

  /**
   * CRUD operations for repositories
   */
  get crud() {
    return repositoryCrudStore;
  }

  /**
   * Search functionality for repositories
   */
  get search() {
    return repositorySearchStore;
  }

  /**
   * Collaborator operations for repositories
   */
  get collaborator() {
    return repositoryCollaboratorStore;
  }

  /**
   * Search repositories with the current filters
   */
  searchRepositories(query?: string): Repository[] {
    // If query is provided, update search query
    if (query !== undefined) {
      this.search.setSearchQuery(query);
    }

    // Create search criteria
    const criteria: SearchCriteria = {
      query: this.search.searchQuery,
      sortBy: this.search.sortField,
      sortDirection: this.search.sortDirection,
    };

    // Execute search
    return this.search.search(criteria);
  }

  /**
   * Set repositories directly
   */
  setRepositories(repositories: Repository[]) {
    this.crud.setItems(repositories);
  }

  /**
   * Clear error state
   */
  clearError() {
    this.crud.setError(null);
  }

  /**
   * Get repository collaborators
   */
  async getRepositoryCollaborators(repositoryId: string): Promise<RepositoryCollaborator[]> {
    const repository = this.repositories.find((repo: Repository) => repo.id === repositoryId);
    if (!repository) return [];

    const updatedRepo = await this.collaborator.fetchRepositoryCollaborators(
      this.repositories,
      repository.owner.login,
      repository.name
    );

    return updatedRepo?.collaborators || [];
  }

  // Proxy methods for backward compatibility
  async fetchUserRepositories() {
    return this.crud.fetchUserRepositories();
  }

  async fetchRepository(owner: string, name: string) {
    return this.crud.fetchRepository(owner, name);
  }

  async createRepository(
    name: string,
    description: string = "",
    visibility: "PRIVATE" | "PUBLIC" | "INTERNAL" = "PRIVATE"
  ) {
    return this.crud.createRepository(name, description, visibility);
  }

  async disableRepository(repositoryId: string) {
    return this.crud.disableRepository(repositoryId);
  }

  async addRepositoryCollaborator(
    repositoryId: string,
    collaboratorData: { username: string; permission: string }
  ) {
    return this.collaborator.addRepositoryCollaborator(repositoryId, collaboratorData);
  }

  async removeRepositoryCollaborator(owner: string, name: string, collaboratorId: string) {
    return this.collaborator.removeRepositoryCollaborator(owner, name, collaboratorId);
  }

  selectRepositoryWithoutFetch(owner: string, name: string) {
    return this.crud.selectRepositoryWithoutFetch(owner, name);
  }

  selectRepository(repository: Repository) {
    this.crud.selectRepository(repository);
  }

  clearSelectedRepository() {
    return this.crud.clearSelectedRepository();
  }
}

// Singleton instance
export const repositoryStore = new RepositoryStore();

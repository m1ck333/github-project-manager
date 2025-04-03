// Import and export all stores
import { Repository } from "../types/repository";

import {
  repositoryCollaboratorStore,
  RepositoryCollaboratorStore,
} from "./repository-collaborator.store";
import { repositoryCrudStore, RepositoryCrudStore } from "./repository-crud.store";
import { repositorySearchStore, RepositorySearchStore } from "./repository-search.store";

/**
 * Combined repository store with access to all store functionality
 */
export class CombinedRepositoryStore {
  crud = repositoryCrudStore;
  collaborator = repositoryCollaboratorStore;
  search = repositorySearchStore;

  // Proxy properties for backward compatibility
  get loading() {
    return this.crud.loading || this.collaborator.loading;
  }

  get error() {
    return this.crud.error || this.collaborator.error;
  }

  get repositories() {
    return this.crud.repositories;
  }

  get selectedRepository() {
    return this.crud.selectedRepository;
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

  async fetchRepositoryCollaborators(owner: string, name: string) {
    return this.collaborator.fetchRepositoryCollaborators(this.repositories, owner, name);
  }

  selectRepositoryWithoutFetch(owner: string, name: string) {
    return this.crud.selectRepositoryWithoutFetch(owner, name);
  }

  selectRepository(repository: Repository) {
    this.crud.selectRepository(repository);
  }

  clearSelectedRepository() {
    this.crud.clearSelectedRepository();
  }

  searchRepositories(query: string) {
    this.search.setSearchQuery(query);
    return this.search.searchRepositories(this.repositories);
  }

  setRepositories(repositories: Repository[]) {
    this.crud.setRepositories(repositories);
  }

  clearError() {
    this.crud.clearError();
    this.collaborator.clearError();
  }
}

// Export singleton instance
export const repositoryStore = new CombinedRepositoryStore();

// Export store classes for testing
export { RepositoryCrudStore, RepositoryCollaboratorStore, RepositorySearchStore };

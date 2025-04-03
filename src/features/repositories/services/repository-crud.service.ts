import { makeAutoObservable } from "mobx";

import { repositoryStore } from "../stores";
import { Repository } from "../types/repository";

/**
 * Service responsible for repository CRUD operations
 */
export class RepositoryCrudService {
  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Get all repositories
   */
  getRepositories(): Repository[] {
    return repositoryStore.repositories;
  }

  /**
   * Find a repository by ID
   */
  getRepositoryById(id: string): Repository | undefined {
    return repositoryStore.repositories.find((repo) => repo.id === id);
  }

  /**
   * Find a repository by owner and name
   */
  getRepositoryByOwnerAndName(owner: string, name: string): Repository | undefined {
    return repositoryStore.repositories.find(
      (repo) => repo.owner.login === owner && repo.name === name
    );
  }

  /**
   * Fetch all repositories for the authenticated user
   */
  async fetchRepositories(): Promise<Repository[]> {
    try {
      // Use the store to handle fetching
      return repositoryStore.fetchUserRepositories();
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw error;
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(
    name: string,
    description: string = "",
    visibility: "PRIVATE" | "PUBLIC" | "INTERNAL" = "PRIVATE"
  ): Promise<Repository> {
    try {
      // Use the store to handle creation
      return repositoryStore.createRepository(name, description, visibility);
    } catch (error) {
      console.error("Failed to create repository:", error);
      throw error;
    }
  }

  /**
   * Disable a repository
   */
  async disableRepository(repositoryId: string): Promise<boolean> {
    try {
      // Use the store to handle disabling
      return repositoryStore.disableRepository(repositoryId);
    } catch (error) {
      console.error("Failed to disable repository:", error);
      throw error;
    }
  }
}

// Singleton instance
export const repositoryCrudService = new RepositoryCrudService();

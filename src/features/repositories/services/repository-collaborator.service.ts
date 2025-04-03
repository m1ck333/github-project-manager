import { makeAutoObservable } from "mobx";

import { repositoryStore } from "../stores";
import { RepositoryCollaboratorFormData } from "../types/repository";

/**
 * Service responsible for repository collaborator management
 */
export class RepositoryCollaboratorService {
  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Fetch collaborators for a repository
   */
  async fetchRepositoryCollaborators(owner: string, name: string) {
    try {
      // Use the store to handle collaborator fetching
      return repositoryStore.fetchRepositoryCollaborators(owner, name);
    } catch (error) {
      console.error("Failed to fetch repository collaborators:", error);
      throw error;
    }
  }

  /**
   * Add a collaborator to a repository
   */
  async addRepositoryCollaborator(
    owner: string,
    name: string,
    username: string,
    permission: string
  ): Promise<boolean> {
    try {
      // Find the repository by owner and name
      const repository = repositoryStore.repositories.find(
        (repo) => repo.owner.login === owner && repo.name === name
      );

      if (!repository) {
        throw new Error(`Repository ${owner}/${name} not found`);
      }

      // Create collaborator data
      const collaboratorData: RepositoryCollaboratorFormData = {
        username,
        permission,
      };

      // Use the store to handle adding collaborators
      return repositoryStore.addRepositoryCollaborator(repository.id, collaboratorData);
    } catch (error) {
      console.error("Failed to add repository collaborator:", error);
      throw error;
    }
  }

  /**
   * Remove a collaborator from a repository
   */
  async removeRepositoryCollaborator(
    owner: string,
    name: string,
    collaboratorLogin: string
  ): Promise<boolean> {
    try {
      // Use the store to handle removing collaborators
      return repositoryStore.removeRepositoryCollaborator(owner, name, collaboratorLogin);
    } catch (error) {
      console.error("Failed to remove repository collaborator:", error);
      throw error;
    }
  }
}

// Singleton instance
export const repositoryCollaboratorService = new RepositoryCollaboratorService();

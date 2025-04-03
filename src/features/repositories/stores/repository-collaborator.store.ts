import { makeAutoObservable, action } from "mobx";

import {
  Repository,
  RepositoryCollaborator,
  RepositoryCollaboratorFormData,
} from "../types/repository";

/**
 * Store responsible for managing repository collaborators
 */
export class RepositoryCollaboratorStore {
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      startLoading: action,
      finishLoading: action,
      handleError: action,
      clearError: action,
    });
  }

  /**
   * Start loading state
   */
  startLoading() {
    this.loading = true;
  }

  /**
   * Finish loading state
   */
  finishLoading() {
    this.loading = false;
  }

  /**
   * Handle error
   */
  handleError(error: unknown) {
    this.error = error instanceof Error ? error.message : String(error);
  }

  /**
   * Clear any error
   */
  clearError() {
    this.error = null;
  }

  /**
   * Fetch collaborators for a repository
   * @param repositories Array of all repositories
   * @param owner Repository owner
   * @param name Repository name
   */
  async fetchRepositoryCollaborators(
    repositories: Repository[],
    owner: string,
    name: string
  ): Promise<Repository | undefined> {
    try {
      this.startLoading();
      this.clearError();

      // Find the repository in the provided list
      const repository = repositories.find((r) => r.owner.login === owner && r.name === name);

      if (!repository) {
        throw new Error(`Repository ${owner}/${name} not found`);
      }

      // In a real implementation, we would fetch from the API
      // For now, just simulate collaborator data if none exists
      if (!repository.collaborators || repository.collaborators.length === 0) {
        const dummyCollaborator: RepositoryCollaborator = {
          id: "123456",
          login: owner,
          avatarUrl: repository.owner.avatar_url,
          permission: "ADMIN",
        };

        // Create new repository with collaborator
        const updatedRepository = {
          ...repository,
          collaborators: [dummyCollaborator],
        };

        return updatedRepository;
      }

      // Return the repository with existing collaborators
      return repository;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.finishLoading();
    }
  }

  /**
   * Add a collaborator to a repository
   * @param repositoryId Repository ID
   * @param collaboratorData Collaborator form data
   */
  async addRepositoryCollaborator(
    repositoryId: string,
    collaboratorData: RepositoryCollaboratorFormData
  ): Promise<boolean> {
    try {
      this.startLoading();
      this.clearError();

      // In a real implementation, we would make an API call
      console.log(`Adding collaborator ${collaboratorData.username} to repository ${repositoryId}`);

      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.finishLoading();
    }
  }

  /**
   * Remove a collaborator from a repository
   * @param owner Repository owner
   * @param name Repository name
   * @param collaboratorId Collaborator ID
   */
  async removeRepositoryCollaborator(
    owner: string,
    name: string,
    collaboratorId: string
  ): Promise<boolean> {
    try {
      this.startLoading();
      this.clearError();

      // In a real implementation, we would make an API call
      console.log(`Removing collaborator ${collaboratorId} from ${owner}/${name}`);

      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.finishLoading();
    }
  }
}

// Singleton instance
export const repositoryCollaboratorStore = new RepositoryCollaboratorStore();

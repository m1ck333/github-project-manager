import { makeAutoObservable, runInAction } from "mobx";

import { repositoryService } from "../graphql/services";
import { Repository, RepositoryCollaborator, RepositoryCollaboratorFormData } from "../types";

export class RepositoryStore {
  repositories: Repository[] = [];
  loading = false;
  error: string | null = null;
  selectedRepository: Repository | null = null;

  // Track in-progress collaborator fetches to avoid duplicate requests
  private pendingCollaboratorFetches: Record<string, Promise<RepositoryCollaborator[]>> = {};

  constructor() {
    makeAutoObservable(this);
  }

  async fetchUserRepositories() {
    this.loading = true;
    this.error = null;

    try {
      const repositories = await repositoryService.getUserRepositories();

      runInAction(() => {
        this.repositories = repositories;
        this.loading = false;
      });

      return repositories;
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
      throw error;
    }
  }

  async fetchRepository(owner: string, name: string): Promise<Repository | undefined> {
    this.loading = true;
    this.error = null;

    try {
      const repository = await repositoryService.getRepository(owner, name);

      if (repository) {
        runInAction(() => {
          // Add to repositories list if not already there
          const existingIndex = this.repositories.findIndex((r) => r.id === repository.id);

          if (existingIndex >= 0) {
            // Update existing repository
            this.repositories[existingIndex] = repository;
          } else {
            // Add new repository
            this.repositories.push(repository);
          }

          this.loading = false;
        });
      }

      return repository;
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
      return undefined;
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(
    name: string,
    description: string = "",
    visibility: "PUBLIC" | "PRIVATE" = "PRIVATE"
  ): Promise<Repository | undefined> {
    this.loading = true;
    this.error = null;

    try {
      const repository = await repositoryService.createRepository(name, description, visibility);

      if (repository) {
        runInAction(() => {
          // Add to repositories list
          this.repositories.push(repository);
          this.loading = false;
        });
      }

      return repository;
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
      throw error;
    }
  }

  async fetchRepositoryCollaborators(owner: string, name: string) {
    // Create a cache key for this specific repo
    const cacheKey = `${owner}/${name}`;

    // If there's already a fetch in progress for this repo, return that promise
    if (cacheKey in this.pendingCollaboratorFetches) {
      return this.pendingCollaboratorFetches[cacheKey];
    }

    this.loading = true;
    this.error = null;

    // Create the promise for this fetch
    const fetchPromise = (async () => {
      try {
        // Make sure the repository exists in our store
        let repository: Repository | undefined = this.repositories.find(
          (r) => r.owner.login === owner && r.name === name
        );

        if (!repository) {
          // If not, fetch it first
          repository = await this.fetchRepository(owner, name);
          if (!repository) {
            throw new Error(`Repository ${owner}/${name} not found`);
          }
        }

        // Skip if collaborators are already fetched
        if (repository.collaborators && repository.collaborators.length > 0) {
          return repository.collaborators;
        }

        // Now fetch the collaborators
        const collaborators = await repositoryService.getRepositoryCollaborators(owner, name);

        // Update the store
        runInAction(() => {
          const index = this.repositories.findIndex((r) => r.id === repository!.id);
          if (index !== -1) {
            this.repositories[index].collaborators = collaborators;
          }
          if (this.selectedRepository?.id === repository!.id) {
            this.selectedRepository.collaborators = collaborators;
          }
          this.loading = false;
        });

        return collaborators;
      } catch (error) {
        runInAction(() => {
          this.error = (error as Error).message;
          this.loading = false;
        });
        return [];
      } finally {
        // Clean up the pending request when done
        delete this.pendingCollaboratorFetches[cacheKey];
      }
    })();

    // Store the promise so we can return it for duplicate requests
    this.pendingCollaboratorFetches[cacheKey] = fetchPromise;
    return fetchPromise;
  }

  async addRepositoryCollaborator(
    owner: string,
    repoName: string,
    collaboratorData: RepositoryCollaboratorFormData
  ) {
    this.loading = true;
    this.error = null;

    try {
      const repository = this.repositories.find(
        (r) => r.owner.login === owner && r.name === repoName
      );
      if (!repository) {
        throw new Error("Repository not found");
      }

      // Call the service to add the collaborator
      const success = await repositoryService.addRepositoryCollaborator(
        owner,
        repoName,
        collaboratorData
      );

      if (success) {
        // Create a temporary collaborator for the UI
        // In a real app, you'd refetch the collaborators to get the actual data
        const mockCollaborator: RepositoryCollaborator = {
          id: `temp-${Date.now()}`,
          login: collaboratorData.username,
          avatarUrl: `https://avatars.githubusercontent.com/${collaboratorData.username}`,
          permission: collaboratorData.permission,
        };

        // Update the UI
        runInAction(() => {
          if (!repository.collaborators) {
            repository.collaborators = [];
          }
          repository.collaborators.push(mockCollaborator);
          this.loading = false;
        });

        return mockCollaborator;
      } else {
        throw new Error("Failed to add collaborator via API");
      }
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
      throw error;
    }
  }

  async removeRepositoryCollaborator(owner: string, repoName: string, collaboratorId: string) {
    this.loading = true;
    this.error = null;

    try {
      const repository = this.repositories.find(
        (r) => r.owner.login === owner && r.name === repoName
      );
      if (!repository || !repository.collaborators) {
        throw new Error("Repository or collaborators not found");
      }

      // Find the collaborator in our store to get their username
      const collaborator = repository.collaborators.find((c) => c.id === collaboratorId);
      if (!collaborator) {
        throw new Error("Collaborator not found in repository");
      }

      // Call the service to remove the collaborator using their username
      const success = await repositoryService.removeRepositoryCollaborator(
        owner,
        repoName,
        collaborator.login
      );

      if (success) {
        // Update the UI
        runInAction(() => {
          repository.collaborators = repository.collaborators!.filter(
            (c) => c.id !== collaboratorId
          );
          this.loading = false;
        });

        return true;
      } else {
        throw new Error("Failed to remove collaborator via API");
      }
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
      throw error;
    }
  }

  selectRepository(repository: Repository) {
    this.selectedRepository = repository;
  }

  clearSelectedRepository() {
    this.selectedRepository = null;
  }

  clearError() {
    this.error = null;
  }
}

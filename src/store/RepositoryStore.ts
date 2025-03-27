import { makeAutoObservable, runInAction } from "mobx";
import { Repository, RepositoryCollaborator, RepositoryCollaboratorFormData } from "../types";
import { repositoryService } from "../graphql/services";

export class RepositoryStore {
  repositories: Repository[] = [];
  loading = false;
  error: string | null = null;
  selectedRepository: Repository | null = null;

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

  async fetchRepository(owner: string, name: string) {
    this.loading = true;
    this.error = null;

    try {
      const repository = await repositoryService.getRepository(owner, name);

      // Update the repository in the store
      runInAction(() => {
        if (repository) {
          // If the repository already exists in the store, update it
          const existingIndex = this.repositories.findIndex((r) => r.id === repository.id);
          if (existingIndex !== -1) {
            this.repositories[existingIndex] = repository;
          } else {
            // Otherwise add it
            this.repositories.push(repository);
          }
          this.selectedRepository = repository;
        }
        this.loading = false;
      });

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
    this.loading = true;
    this.error = null;

    try {
      // Make sure the repository exists in our store
      let repository = this.repositories.find((r) => r.owner.login === owner && r.name === name);

      if (!repository) {
        // If not, fetch it first
        repository = await this.fetchRepository(owner, name);
        if (!repository) {
          throw new Error(`Repository ${owner}/${name} not found`);
        }
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
      throw error;
    }
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

  selectRepository(repositoryId: string) {
    this.selectedRepository = this.repositories.find((r) => r.id === repositoryId) || null;
  }

  clearSelectedRepository() {
    this.selectedRepository = null;
  }

  clearError() {
    this.error = null;
  }
}

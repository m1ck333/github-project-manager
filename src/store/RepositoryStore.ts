import { makeAutoObservable, runInAction } from "mobx";

import { client } from "../api/client";
import { RepositoryPermission, RepositoryVisibility } from "../api/generated/graphql";
import {
  CreateRepositoryDocument,
  AddRepositoryCollaboratorDocument,
  DeleteRepositoryDocument,
} from "../api/operations/operation-names";
import { appInitializationService, repositoryService } from "../services";
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
      // Get repositories from repositoryService
      const repositories = await repositoryService.fetchRepositories();

      runInAction(() => {
        this.repositories = repositories;
        this.loading = false;
      });

      return repositories;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
        this.loading = false;
      });
      throw error;
    }
  }

  async fetchRepository(owner: string, name: string): Promise<Repository | undefined> {
    this.loading = true;
    this.error = null;

    try {
      // Fetch repositories using the repositoryService
      await repositoryService.fetchRepositories();

      // Find the repository in the fetched repositories
      const repository = repositoryService.getRepositoryByOwnerAndName(owner, name);

      if (repository) {
        runInAction(() => {
          // Update our local repositories with the refreshed list
          this.repositories = repositoryService.getRepositories();

          // Also update the selected repository
          this.selectRepository(repository);
          this.loading = false;
        });
        return repository;
      } else {
        throw new Error(`Repository ${owner}/${name} not found in GitHub data`);
      }
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
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
    visibility: "PRIVATE" | "PUBLIC" | "INTERNAL" = "PRIVATE"
  ): Promise<Repository | undefined> {
    this.loading = true;
    this.error = null;

    try {
      // Convert string visibility to RepositoryVisibility enum
      let visibilityEnum: RepositoryVisibility;
      switch (visibility) {
        case "PRIVATE":
          visibilityEnum = RepositoryVisibility.Private;
          break;
        case "PUBLIC":
          visibilityEnum = RepositoryVisibility.Public;
          break;
        case "INTERNAL":
          visibilityEnum = RepositoryVisibility.Internal;
          break;
        default:
          visibilityEnum = RepositoryVisibility.Private;
      }

      const input = {
        name,
        description: description || undefined,
        visibility: visibilityEnum,
      };

      const { data, error } = await client
        .mutation(CreateRepositoryDocument, { input })
        .toPromise();

      interface CreateRepositoryResponse {
        createRepository: {
          repository: {
            id: string;
            name: string;
            description: string | null;
            url: string;
            createdAt: string;
            owner: {
              login: string;
              avatarUrl: string;
            };
          };
        };
      }

      // Safe type assertion
      const typedData = data as unknown as CreateRepositoryResponse;

      if (error || !typedData?.createRepository?.repository) {
        throw new Error(error?.message || "Failed to create repository");
      }

      // Create repository directly from the mutation response data
      const repoData = typedData.createRepository.repository;
      const newRepo: Repository = {
        id: repoData.id,
        name: repoData.name,
        owner: {
          login: repoData.owner.login,
          avatar_url: repoData.owner.avatarUrl,
        },
        description: repoData.description || "",
        html_url: repoData.url,
        createdAt: repoData.createdAt,
        collaborators: [],
      };

      // Update our local repositories list
      runInAction(() => {
        this.repositories.push(newRepo);
        this.loading = false;
      });

      // Refresh all data from GitHub in the background
      // but don't wait for it or rely on it for the repository data
      repositoryService.fetchRepositories().catch(console.error);

      return newRepo;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
        this.loading = false;
      });
      throw error;
    }
  }

  /**
   * Disable a repository using GraphQL
   * Note: GitHub's GraphQL API doesn't support true repository deletion,
   * so we use updateRepository to disable features (soft delete)
   */
  async disableRepository(owner: string, name: string): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      // First, check if the repository exists
      const repository = this.repositories.find(
        (repo) => repo.owner.login === owner && repo.name === name
      );

      if (!repository) {
        throw new Error(`Repository ${owner}/${name} not found`);
      }

      // Update the local state optimistically
      runInAction(() => {
        this.repositories = this.repositories.filter(
          (repo) => !(repo.owner.login === owner && repo.name === name)
        );
      });

      // Use GraphQL to update the repository - this is a "soft delete"
      // as GitHub's GraphQL API doesn't support real repository deletion
      const { error } = await client
        .mutation(DeleteRepositoryDocument, { repositoryId: repository.id })
        .toPromise();

      if (error) {
        throw new Error(`Failed to disable repository: ${error.message}`);
      }

      // Refresh data to ensure our state is in sync
      await repositoryService.fetchRepositories();

      runInAction(() => {
        this.loading = false;
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
        this.loading = false;
      });
      throw error;
    }
  }

  // Keep the old method name for backward compatibility
  async deleteRepository(owner: string, name: string): Promise<boolean> {
    return this.disableRepository(owner, name);
  }

  async fetchRepositoryCollaborators(owner: string, name: string) {
    // Create a cache key for this specific repo
    const cacheKey = `${owner}/${name}`;

    // If there's already a fetch in progress for this repo, return that promise
    if (cacheKey in this.pendingCollaboratorFetches) {
      return this.pendingCollaboratorFetches[cacheKey];
    }

    // Don't set loading state here to avoid duplicate state changes
    this.error = null;

    // Create the promise for this fetch
    const fetchPromise = (async () => {
      try {
        // Ensure we have the latest data
        await repositoryService.fetchRepositories();

        // Find the repository in our store
        const repository = this.repositories.find(
          (r) => r.owner.login === owner && r.name === name
        );

        if (!repository) {
          throw new Error(`Repository ${owner}/${name} not found in store`);
        }

        // Skip if collaborators are already fetched
        if (repository.collaborators && repository.collaborators.length > 0) {
          return repository.collaborators;
        }

        // Get the repositories from repositoryService to get the collaborators
        const repos = repositoryService.getRepositories();
        const repoWithCollaborators = repos.find((r) => r.owner.login === owner && r.name === name);

        if (!repoWithCollaborators) {
          throw new Error(`Repository ${owner}/${name} not found in app data`);
        }

        const collaborators = repoWithCollaborators.collaborators || [];

        // Update the store
        runInAction(() => {
          // Find the repository again to ensure we have the latest reference
          const index = this.repositories.findIndex(
            (r) => r.owner.login === owner && r.name === name
          );

          if (index !== -1) {
            this.repositories[index].collaborators = collaborators;
          }

          if (
            this.selectedRepository?.owner.login === owner &&
            this.selectedRepository.name === name
          ) {
            this.selectedRepository.collaborators = collaborators;
          }
        });

        return collaborators;
      } catch (error) {
        runInAction(() => {
          this.error = error instanceof Error ? error.message : String(error);
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

      // Convert permission string to the format expected by GitHub
      const permission = collaboratorData.permission.toUpperCase();

      // First step: Use GraphQL mutation as a simple check for API access
      // Note: This will generate "variable not used" warnings for userLogin and permission
      // These warnings are harmless - the variables are used in the REST API call
      try {
        const { error: apiAccessError } = await client
          .mutation(AddRepositoryCollaboratorDocument, {
            repositoryId: repository.id,
            userLogin: collaboratorData.username,
            permission: permission as RepositoryPermission,
          })
          .toPromise();

        if (apiAccessError) {
          throw new Error(`API access error: ${apiAccessError.message}`);
        }
      } catch (error) {
        // Handle the specific case of variable not used warnings
        if (error instanceof Error && error.message.includes("Variable")) {
          console.warn("Ignoring GraphQL variable warnings as they're expected:", error.message);
          // Continue execution - these warnings don't affect functionality
        } else {
          // It's a real error, rethrow it
          throw error;
        }
      }

      // Second step: Use REST API to actually add the collaborator
      // Access token is needed for the REST API call
      const token = localStorage.getItem("github_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Use GitHub REST API to add the collaborator
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/collaborators/${collaboratorData.username}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({ permission: collaboratorData.permission }),
        }
      );

      if (!response.ok) {
        // If response is not OK, parse the error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add collaborator: ${response.statusText}`);
      }

      // Create a temporary collaborator for optimistic UI update
      const mockCollaborator: RepositoryCollaborator = {
        id: `temp-${Date.now()}`,
        login: collaboratorData.username,
        avatarUrl: `https://avatars.githubusercontent.com/${collaboratorData.username}`,
        permission: collaboratorData.permission,
      };

      // Update the UI optimistically
      runInAction(() => {
        if (!repository.collaborators) {
          repository.collaborators = [];
        }
        repository.collaborators.push(mockCollaborator);
      });

      // Refresh all data to get the actual updated collaborators
      await repositoryService.fetchRepositories();

      // Get the updated repository
      const updatedRepo = repositoryService
        .getRepositories()
        .find((r) => r.owner.login === owner && r.name === repoName);

      if (updatedRepo && updatedRepo.collaborators) {
        runInAction(() => {
          // Update the repository in our store
          const index = this.repositories.findIndex(
            (r) => r.owner.login === owner && r.name === repoName
          );

          if (index !== -1) {
            this.repositories[index].collaborators = updatedRepo.collaborators;
          }

          if (
            this.selectedRepository?.owner.login === owner &&
            this.selectedRepository.name === repoName
          ) {
            this.selectedRepository.collaborators = updatedRepo.collaborators;
          }

          this.loading = false;
        });
      } else {
        // Keep the mock collaborator if we can't get the updated data
        this.loading = false;
      }

      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
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

      // Find the collaborator in our store
      const collaborator = repository.collaborators.find((c) => c.id === collaboratorId);
      if (!collaborator) {
        throw new Error("Collaborator not found in repository");
      }

      // Access token is needed for the REST API call
      const token = localStorage.getItem("github_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Use GitHub REST API to remove the collaborator
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/collaborators/${collaborator.login}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        // If response is not OK, parse the error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to remove collaborator: ${response.statusText}`
        );
      }

      // Update the UI optimistically
      runInAction(() => {
        repository.collaborators = repository.collaborators!.filter((c) => c.id !== collaboratorId);
      });

      // Refresh data to sync with server state
      await repositoryService.fetchRepositories();
      this.loading = false;

      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
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

  /**
   * Set repositories directly from app initialization data
   */
  setRepositories(repositories: Repository[]) {
    this.repositories = repositories;
    this.loading = false;
    this.error = null;
  }
}

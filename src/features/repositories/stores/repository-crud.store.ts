import { makeAutoObservable, runInAction, action } from "mobx";

import { RepositoryVisibility } from "@/api/generated/graphql";
import { graphQLClientService } from "@/services/graphql-client.service";

import { RepositoryApiModel } from "../api";
import { CreateRepositoryDocument } from "../api/mutations";
import { GetAllInitialDataDocument } from "../api/queries";
import { mapToRepository } from "../lib/mappers/repository.mapper";
import { Repository } from "../types/repository";

/**
 * Store responsible for repository CRUD operations
 */
export class RepositoryCrudStore {
  repositories: Repository[] = [];
  selectedRepository: Repository | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      startLoading: action,
      finishLoading: action,
      updateRepositories: action,
      handleError: action,
      clearError: action,
      selectRepository: action,
      clearSelectedRepository: action,
      setRepositories: action,
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
   * Update repositories
   */
  updateRepositories(repositories: Repository[]) {
    runInAction(() => {
      this.repositories = repositories;
      this.error = null;
    });
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
   * Fetch user repositories
   */
  async fetchUserRepositories() {
    try {
      this.startLoading();
      this.clearError();

      // Fetch repositories from GitHub API
      const result = await graphQLClientService.query(GetAllInitialDataDocument, {});

      // Type casting with a more specific interface
      interface ViewerResponse {
        viewer?: {
          repositories?: {
            nodes?: Array<unknown> | null;
          } | null;
        } | null;
      }

      const data = result as ViewerResponse;

      if (!data?.viewer?.repositories?.nodes) {
        throw new Error("Failed to fetch repositories");
      }

      // Map to our domain model
      const repositories = (data.viewer.repositories.nodes || [])
        .filter(Boolean)
        .map((node) => mapToRepository(node as Partial<RepositoryApiModel>));

      this.updateRepositories(repositories);
      return repositories;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.finishLoading();
    }
  }

  /**
   * Fetch a specific repository
   */
  async fetchRepository(owner: string, name: string): Promise<Repository | undefined> {
    try {
      this.startLoading();
      this.clearError();

      // Look in local repository cache first
      const cachedRepo = this.repositories.find((r) => r.owner.login === owner && r.name === name);
      if (cachedRepo) {
        this.selectRepository(cachedRepo);
        return cachedRepo;
      }

      // In a real implementation, we would fetch from the API here
      // For now, just return undefined if not in cache
      console.log(`Repository ${owner}/${name} not found in local cache`);
      return undefined;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.finishLoading();
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
      this.startLoading();
      this.clearError();

      // Convert string visibility to RepositoryVisibility enum
      const visibilityEnum = this.mapVisibility(visibility);

      // Call the GraphQL API
      const result = await graphQLClientService.mutation(CreateRepositoryDocument, {
        input: {
          name,
          description: description || undefined,
          visibility: visibilityEnum,
        },
      });

      // Type casting with a more specific interface
      interface CreateRepositoryResponse {
        createRepository?: {
          repository?: unknown;
        } | null;
      }

      const response = result as CreateRepositoryResponse;

      if (!response?.createRepository?.repository) {
        throw new Error("Failed to create repository");
      }

      // Map to our domain model
      const repository = mapToRepository(
        response.createRepository.repository as Partial<RepositoryApiModel>
      );

      // Add to repositories list
      this.updateRepositories([...this.repositories, repository]);

      return repository;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.finishLoading();
    }
  }

  /**
   * Map string visibility to RepositoryVisibility enum
   */
  private mapVisibility(visibility: "PRIVATE" | "PUBLIC" | "INTERNAL"): RepositoryVisibility {
    switch (visibility) {
      case "PUBLIC":
        return RepositoryVisibility.Public;
      case "PRIVATE":
        return RepositoryVisibility.Private;
      case "INTERNAL":
        return RepositoryVisibility.Internal;
      default:
        return RepositoryVisibility.Private;
    }
  }

  /**
   * Disable (delete) a repository
   */
  async disableRepository(repositoryId: string): Promise<boolean> {
    try {
      this.startLoading();
      this.clearError();

      const repository = this.repositories.find((r) => r.id === repositoryId);

      if (!repository) {
        throw new Error(`Repository with ID ${repositoryId} not found`);
      }

      // In a real implementation, we would make a GraphQL API call
      console.log(`Disabling repository: ${repositoryId}`);

      // Remove from repositories list (optimistic update)
      this.updateRepositories(this.repositories.filter((r) => r.id !== repositoryId));

      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    } finally {
      this.finishLoading();
    }
  }

  /**
   * Select a repository without triggering a fetch
   */
  selectRepositoryWithoutFetch(owner: string, name: string): Repository | undefined {
    const repository = this.repositories.find((r) => r.owner.login === owner && r.name === name);

    if (repository) {
      this.selectedRepository = repository;
      return repository;
    }

    return undefined;
  }

  /**
   * Select a repository
   */
  selectRepository(repository: Repository): void {
    this.selectedRepository = repository;
  }

  /**
   * Clear the selected repository
   */
  clearSelectedRepository() {
    this.selectedRepository = null;
  }

  /**
   * Set repositories - Called by the app-init service
   */
  setRepositories(repositories: Repository[]) {
    this.updateRepositories(repositories);
  }
}

// Singleton instance of the repository CRUD store
export const repositoryCrudStore = new RepositoryCrudStore();

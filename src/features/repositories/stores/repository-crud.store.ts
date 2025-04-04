import { makeAutoObservable, runInAction, action } from "mobx";

import { executeGitHubQuery, executeGitHubMutation } from "@/api-github";
import { RepositoryVisibility } from "@/api-github/generated/graphql";
import { CreateRepositoryDocument, GetAllInitialDataDocument } from "@/features/repositories/api";

import { mapToRepository } from "../mappers/repository.mapper";
import { Repository } from "../types/repository";
import {
  RepositoryApiModel,
  ViewerResponse,
  CreateRepositoryResponse,
} from "../types/repository-api.types";

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
      const { data, error } = await executeGitHubQuery(GetAllInitialDataDocument, {});

      if (error || !data) {
        throw error || new Error("Failed to fetch repositories: No data returned");
      }

      // Type casting with the imported interface
      const viewerData = data as ViewerResponse;

      if (!viewerData?.viewer?.repositories?.nodes) {
        throw new Error("Failed to fetch repositories");
      }

      // Map to our domain model
      const repositories = (viewerData.viewer.repositories.nodes || [])
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
      const { data, error } = await executeGitHubMutation(CreateRepositoryDocument, {
        input: {
          name,
          description: description || undefined,
          visibility: visibilityEnum,
        },
      });

      if (error || !data) {
        throw error || new Error("Failed to create repository: No data returned");
      }

      // Type casting with the imported interface
      const response = data as CreateRepositoryResponse;

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

import { action } from "mobx";

import { executeGitHubQuery, executeGitHubMutation } from "@/api-github";
import { RepositoryVisibility } from "@/api-github/generated/graphql";
import { AbstractCrudStore } from "@/common/stores";
import { CreateRepositoryDocument, GetAllInitialDataDocument } from "@/features/repositories/api";

import { mapToRepository } from "../mappers/repository.mapper";
import {
  RepositoryApiModel,
  ViewerResponse,
  CreateRepositoryResponse,
} from "../types/repository-api.types";

import type { Repository } from "../types/repository";

/**
 * Store responsible for repository CRUD operations
 * Extends the AbstractCrudStore to leverage common CRUD functionality
 */
export class RepositoryCrudStore extends AbstractCrudStore<Repository> {
  selectedRepository: Repository | null = null;

  /**
   * Fetch user repositories
   */
  async fetchUserRepositories(): Promise<Repository[]> {
    try {
      this.setLoading(true);
      this.setError(null);

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

      // Update the items using the base class method
      this.setItems(repositories);
      return repositories;
    } catch (error) {
      this.setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Fetch a specific repository
   */
  async fetchRepository(owner: string, name: string): Promise<Repository | undefined> {
    try {
      this.setLoading(true);
      this.setError(null);

      // Look in local repository cache first
      const cachedRepo = this.items.find((r) => r.owner.login === owner && r.name === name);
      if (cachedRepo) {
        this.selectRepository(cachedRepo);
        return cachedRepo;
      }

      // In a real implementation, we would fetch from the API here
      // For now, just return undefined if not in cache
      console.log(`Repository ${owner}/${name} not found in local cache`);
      return undefined;
    } catch (error) {
      this.setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Create a new repository
   * Implements the abstract method from AbstractCrudStore
   */
  @action
  create(_repositoryData: Omit<Repository, "id">): Repository {
    throw new Error("Direct creation not supported. Use createRepository method instead.");
  }

  /**
   * Create a new repository with the GitHub API
   */
  async createRepository(
    name: string,
    description: string = "",
    visibility: "PRIVATE" | "PUBLIC" | "INTERNAL" = "PRIVATE"
  ): Promise<Repository> {
    try {
      this.setLoading(true);
      this.setError(null);

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

      // Add to repositories list using the base class update method
      this.setItems([...this.items, repository]);

      return repository;
    } catch (error) {
      this.setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.setLoading(false);
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
   * Disable a repository (soft delete)
   */
  async disableRepository(repositoryId: string): Promise<boolean> {
    try {
      this.setLoading(true);
      this.setError(null);

      // In a real implementation, call the API to disable the repository
      // For this example, we'll just remove it from our local collection

      // Use the delete method from the base class
      const success = this.delete(repositoryId);

      if (!success) {
        throw new Error(`Repository with ID ${repositoryId} not found`);
      }

      return true;
    } catch (error) {
      this.setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Select a repository by owner and name without fetching
   */
  selectRepositoryWithoutFetch(owner: string, name: string): Repository | undefined {
    const repository = this.items.find((r) => r.owner.login === owner && r.name === name);

    if (repository) {
      this.selectRepository(repository);
    }

    return repository;
  }

  /**
   * Select a repository
   */
  @action
  selectRepository(repository: Repository): void {
    this.selectedRepository = repository;
  }

  /**
   * Clear selected repository
   */
  @action
  clearSelectedRepository(): void {
    this.selectedRepository = null;
  }
}

// Create singleton instance
export const repositoryCrudStore = new RepositoryCrudStore();

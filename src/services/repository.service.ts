import { RepositoryVisibility } from "../api/generated/graphql";
import {
  GetAllInitialDataDocument,
  AddRepositoryCollaboratorDocument,
  RemoveRepositoryCollaboratorDocument,
  CreateRepositoryDocument,
  DeleteRepositoryDocument,
} from "../api/operations/operation-names";
import { GithubRepositoryData, mapToRepository } from "../core/mappers/repository.mapper";
import { Repository, RepositoryCollaborator, RepositoryCollaboratorFormData } from "../core/types";

import { graphQLClientService } from "./graphql-client.service";

/**
 * Service responsible for repository-related operations
 */
export class RepositoryService {
  private repositories: Repository[] = [];

  /**
   * Get all repositories
   */
  getRepositories(): Repository[] {
    return this.repositories;
  }

  /**
   * Find a repository by ID
   */
  getRepositoryById(id: string): Repository | undefined {
    return this.repositories.find((repo) => repo.id === id);
  }

  /**
   * Find a repository by owner and name
   */
  getRepositoryByOwnerAndName(owner: string, name: string): Repository | undefined {
    return this.repositories.find((repo) => repo.owner.login === owner && repo.name === name);
  }

  /**
   * Fetch repositories from GitHub API
   */
  async fetchRepositories(): Promise<Repository[]> {
    const data = await graphQLClientService.query(GetAllInitialDataDocument, {});

    if (!data.viewer || !data.viewer.repositories || !data.viewer.repositories.nodes) {
      throw new Error("Failed to fetch repositories");
    }

    const repositories: Repository[] = (data.viewer.repositories.nodes || [])
      .filter(Boolean)
      .map((repo) => {
        if (!repo) return null;
        return mapToRepository(repo as unknown as GithubRepositoryData);
      })
      .filter(Boolean) as Repository[];

    this.repositories = repositories;
    return repositories;
  }

  /**
   * Create a new repository
   */
  async createRepository(
    name: string,
    description: string = "",
    visibility: "PRIVATE" | "PUBLIC" | "INTERNAL" = "PRIVATE"
  ): Promise<Repository> {
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

    try {
      const data = await graphQLClientService.mutation(CreateRepositoryDocument, { input });

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

      if (!typedData?.createRepository?.repository) {
        throw new Error("Failed to create repository");
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

      return newRepo;
    } catch (error) {
      console.error("Failed to create repository:", error);
      throw error;
    }
  }

  /**
   * Disable a repository using GraphQL
   * Note: GitHub's GraphQL API doesn't support true repository deletion,
   * so we use updateRepository to disable features (soft delete)
   */
  async disableRepository(repositoryId: string): Promise<boolean> {
    try {
      await graphQLClientService.mutation(DeleteRepositoryDocument, { repositoryId });
      return true;
    } catch (error) {
      console.error("Failed to disable repository:", error);
      throw error;
    }
  }

  /**
   * Add a repository collaborator using GraphQL
   */
  async addRepositoryCollaborator(
    repositoryId: string,
    collaboratorData: RepositoryCollaboratorFormData
  ): Promise<boolean> {
    try {
      await graphQLClientService.mutation(AddRepositoryCollaboratorDocument, {
        repositoryId,
        username: collaboratorData.username,
        permission: collaboratorData.permission,
      });

      return true;
    } catch (error) {
      console.error("Failed to add repository collaborator:", error);
      throw error;
    }
  }

  /**
   * Remove a repository collaborator using GraphQL
   */
  async removeRepositoryCollaborator(repositoryId: string, username: string): Promise<boolean> {
    try {
      await graphQLClientService.mutation(RemoveRepositoryCollaboratorDocument, {
        repositoryId,
        username,
      });

      return true;
    } catch (error) {
      console.error("Failed to remove repository collaborator:", error);
      throw error;
    }
  }

  /**
   * Set repositories directly
   */
  setRepositories(repositories: Repository[]): void {
    this.repositories = repositories;
  }
}

export const repositoryService = new RepositoryService();

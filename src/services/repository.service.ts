import { GetAllInitialDataDocument } from "../api/operations/operation-names";
import { GithubRepositoryData, mapToRepository } from "../core/mappers/github/repository.mapper";
import { Repository } from "../core/types";

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
   * Set repositories directly
   */
  setRepositories(repositories: Repository[]): void {
    this.repositories = repositories;
  }
}

export const repositoryService = new RepositoryService();

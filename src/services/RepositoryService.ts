import { GetAllInitialDataDocument } from "../api/operations/operation-names";
import { Repository } from "../types";

import { graphQLClientService } from "./GraphQLClientService";

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

        // Transform repository collaborators
        const collaborators = (repo.collaborators?.edges || [])
          .filter(Boolean)
          .map((edge) => {
            if (!edge || !edge.node) return null;
            return {
              id: edge.node.id,
              login: edge.node.login,
              avatarUrl: edge.node.avatarUrl,
              permission: edge.permission || "READ",
              isCurrentUser: edge.node.login === data.viewer.login,
            };
          })
          .filter(Boolean);

        return {
          id: repo.id,
          name: repo.name,
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatarUrl,
          },
          description: repo.description || undefined,
          html_url: repo.url,
          createdAt: repo.createdAt,
          collaborators,
        };
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

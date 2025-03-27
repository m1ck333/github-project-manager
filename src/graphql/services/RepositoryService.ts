/**
 * Repository Service
 *
 * Service class to handle all repository-related operations.
 * Uses the GraphQL API for repository queries and REST API for collaborator operations.
 */
import { client } from "../client";
import { Repository, RepositoryCollaborator, RepositoryCollaboratorFormData } from "../../types";
import {
  GetRepositoryDocument,
  GetRepoCollaboratorsDocument,
  GetUserRepositoriesDocument,
} from "../generated/graphql";
import { CombinedError } from "urql";
import { env } from "@/config/env";

// Define specific types for the GraphQL response data
interface RepositoryData {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
}

interface CollaboratorNode {
  id: string;
  login: string;
  avatarUrl: string;
}

interface CollaboratorEdge {
  permission: string;
}

/**
 * Service for managing GitHub repositories and their collaborators
 */
export class RepositoryService {
  private client = client;
  // GitHub API token
  private token = env.githubToken;
  // GitHub API base URL
  private apiBaseUrl = "https://api.github.com";

  /**
   * Get a repository by owner and name
   */
  async getRepository(owner: string, name: string): Promise<Repository | null> {
    try {
      const { data, error } = await this.client
        .query(GetRepositoryDocument, { owner, name })
        .toPromise();

      if (error || !data?.repository) {
        console.error("Error fetching repository:", error);
        return null;
      }

      // Cast to our defined type instead of using 'any'
      const repo = data.repository as RepositoryData;
      return {
        id: repo.id,
        name: repo.name,
        description: repo.description || undefined,
        html_url: repo.url,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatarUrl,
        },
      };
    } catch (error) {
      console.error(
        "Error fetching repository:",
        error instanceof Error ? error.message : String(error)
      );
      return null;
    }
  }

  /**
   * Get collaborators for a repository
   */
  async getRepositoryCollaborators(owner: string, name: string): Promise<RepositoryCollaborator[]> {
    try {
      const { data, error } = await this.client
        .query(GetRepoCollaboratorsDocument, { owner, name })
        .toPromise();

      if (error || !data?.repository?.collaborators) {
        console.error("Error fetching collaborators:", error);
        return [];
      }

      // GitHub API returns nodes and edges separately, we need to combine them
      // Use proper typing instead of 'any'
      const nodes = (data.repository.collaborators.nodes || []) as CollaboratorNode[];
      const edges = (data.repository.collaborators.edges || []) as { permission: string }[];

      return nodes
        .filter((node): node is CollaboratorNode => node !== null)
        .map((node, index) => ({
          id: node.id,
          login: node.login,
          avatarUrl: node.avatarUrl,
          permission: edges[index]?.permission || "read",
        }));
    } catch (error) {
      console.error(
        "Error fetching collaborators:",
        error instanceof Error ? error.message : String(error)
      );
      return [];
    }
  }

  /**
   * Add a collaborator to a repository using REST API
   */
  async addRepositoryCollaborator(
    repositoryOwner: string,
    repositoryName: string,
    collaboratorData: RepositoryCollaboratorFormData
  ): Promise<boolean> {
    try {
      if (!this.token) {
        console.error(
          "GitHub token not found. Please set REACT_APP_GITHUB_TOKEN environment variable"
        );
        return false;
      }

      // GitHub REST API endpoint to add a collaborator
      const url = `${this.apiBaseUrl}/repos/${repositoryOwner}/${repositoryName}/collaborators/${collaboratorData.username}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permission: collaboratorData.permission,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding collaborator:", errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error adding repository collaborator:", error);
      return false;
    }
  }

  /**
   * Remove a collaborator from a repository using REST API
   */
  async removeRepositoryCollaborator(
    repositoryOwner: string,
    repositoryName: string,
    username: string
  ): Promise<boolean> {
    try {
      if (!this.token) {
        console.error(
          "GitHub token not found. Please set REACT_APP_GITHUB_TOKEN environment variable"
        );
        return false;
      }

      // GitHub REST API endpoint to remove a collaborator
      const url = `${this.apiBaseUrl}/repos/${repositoryOwner}/${repositoryName}/collaborators/${username}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error removing collaborator:", errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error removing repository collaborator:", error);
      return false;
    }
  }

  // Method to get user's repositories
  async getUserRepositories(): Promise<Repository[]> {
    try {
      const { data, error } = await this.client.query(GetUserRepositoriesDocument, {}).toPromise();

      if (error || !data?.viewer?.repositories?.nodes) {
        console.error("Error fetching user repositories:", error);
        return [];
      }

      // Filter out null nodes and transform to our Repository type
      return data.viewer.repositories.nodes
        .filter((node): node is NonNullable<typeof node> => node !== null)
        .map((repo) => ({
          id: repo.id,
          name: repo.name,
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatarUrl,
          },
          description: repo.description || undefined,
          html_url: repo.url,
          createdAt: repo.createdAt,
          collaborators: [],
        }));
    } catch (error: unknown) {
      console.error("Error fetching user repositories:", error);
      return [];
    }
  }
}

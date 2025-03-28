/**
 * Repository Service
 *
 * Service class to handle all repository-related operations.
 * Uses the GraphQL API for repository queries and REST API for collaborator operations.
 */
import { env } from "@/config/env";
import { GITHUB_API_URL, GITHUB_GRAPHQL_API_URL } from "@/constants/github";
import { OPERATIONS } from "@/constants/operations";

import { Repository, RepositoryCollaborator, RepositoryCollaboratorFormData } from "../../types";
import { client } from "../client";
import {
  GetRepositoryDocument,
  GetRepoCollaboratorsDocument,
  GetUserRepositoriesDocument,
} from "../generated/graphql";

import { userService } from "./UserService";

// Define specific types for the GraphQL response data
interface CollaboratorNode {
  id: string;
  login: string;
  avatarUrl: string;
}

// Interface for GraphQL error responses
interface GraphQLErrorResponse {
  errors?: Array<{
    type: string;
    path: string[];
    locations: { line: number; column: number }[];
    message: string;
  }>;
  data?: {
    repository: object | null;
  };
}

// Mark as unused or remove
interface _RepositoryData {
  id: string;
  name: string;
  description: string | null;
  url: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
}

/**
 * Service for managing GitHub repositories and their collaborators
 */
export class RepositoryService {
  private client = client;
  // GitHub API token
  private token = env.githubToken;
  // GitHub API base URL

  /**
   * Ensure token is valid before making API calls
   */
  private async ensureValidToken(): Promise<void> {
    await userService.ensureValidToken();
  }

  /**
   * Get a repository by owner and name
   */
  async getRepository(owner: string, name: string): Promise<Repository | undefined> {
    try {
      // Validate token before proceeding
      await this.ensureValidToken();

      const result = await this.client.query(
        GetRepositoryDocument,
        {
          owner,
          name,
        },
        {
          name: OPERATIONS.GET_REPOSITORY(owner, name),
        }
      );

      // Check for client level errors
      if (result.error) {
        // Check if it's a NOT_FOUND error
        if (
          result.error.message.includes("NOT_FOUND") ||
          result.error.message.includes("Could not resolve to a Repository")
        ) {
          return undefined;
        }
        throw new Error(result.error.message);
      }

      // Check for GraphQL errors in the fetched data (likely JSON response)
      const fetchedData = result.data as unknown as GraphQLErrorResponse;
      if (fetchedData && fetchedData.errors && fetchedData.errors.length > 0) {
        const error = fetchedData.errors[0];
        if (
          error.type === "NOT_FOUND" ||
          error.message.includes("Could not resolve to a Repository")
        ) {
          console.log(`Repository not found: ${owner}/${name}`);
          return undefined;
        }
        throw new Error(error.message);
      }

      if (!result.data?.repository) {
        return undefined;
      }

      // Cast to a proper type instead of any
      const repo = result.data.repository as {
        id: string;
        name: string;
        description?: string;
        url: string;
        owner: {
          login: string;
          avatarUrl: string;
        };
        createdAt?: string;
      };

      return {
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.url,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatarUrl,
        },
        createdAt: repo.createdAt,
        collaborators: undefined,
      };
    } catch (error) {
      console.error("Error fetching repository:", error);

      // Handle client level errors that might have NOT_FOUND info
      if (
        error instanceof Error &&
        (error.message.includes("NOT_FOUND") ||
          error.message.includes("Could not resolve to a Repository"))
      ) {
        return undefined;
      }

      throw error;
    }
  }

  /**
   * Get collaborators for a repository
   */
  async getRepositoryCollaborators(owner: string, name: string): Promise<RepositoryCollaborator[]> {
    try {
      // Validate token before proceeding
      await this.ensureValidToken();

      // Try the GraphQL API first
      try {
        const { data, error } = await this.client
          .query(
            GetRepoCollaboratorsDocument,
            { owner, name },
            {
              name: OPERATIONS.GET_REPO_COLLABORATORS(owner, name),
            }
          )
          .toPromise();

        if (error || !data?.repository?.collaborators) {
          throw new Error("GraphQL query failed, falling back to REST API");
        }

        // GitHub API returns nodes and edges separately, we need to combine them
        const nodes = (data.repository.collaborators.nodes || []) as CollaboratorNode[];
        const edges = (data.repository.collaborators.edges || []) as { permission: string }[];

        // If we have collaborators from GraphQL, use them
        if (nodes.length > 0) {
          return nodes
            .filter((node): node is CollaboratorNode => node !== null)
            .map((node, index) => ({
              id: node.id,
              login: node.login,
              avatarUrl: node.avatarUrl,
              permission: edges[index]?.permission || "read",
            }));
        }

        // If GraphQL returned empty results, we'll try REST API
        throw new Error("No collaborators from GraphQL, falling back to REST API");
      } catch (graphqlError) {
        console.warn("GraphQL collaborator fetch failed, using REST API:", graphqlError);

        // Fall back to REST API
        const url = `${GITHUB_API_URL}/repos/${owner}/${name}/collaborators`;

        const response = await fetch(url, {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${this.token}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        if (!response.ok) {
          console.error("REST API request failed:", response.statusText);
          return [];
        }

        interface RestCollaborator {
          id: number;
          login: string;
          avatar_url: string;
          permissions: {
            admin: boolean;
            maintain: boolean;
            push: boolean;
            triage: boolean;
            pull: boolean;
          };
        }

        const collaborators = (await response.json()) as RestCollaborator[];
        return collaborators.map((collab) => ({
          id: collab.id.toString(),
          login: collab.login,
          avatarUrl: collab.avatar_url,
          permission: collab.permissions.admin
            ? "admin"
            : collab.permissions.maintain
              ? "maintain"
              : collab.permissions.push
                ? "write"
                : collab.permissions.triage
                  ? "triage"
                  : "read",
        }));
      }
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
      // Validate token before proceeding
      await this.ensureValidToken();

      // GitHub REST API endpoint to add a collaborator
      const url = `${GITHUB_API_URL}/repos/${repositoryOwner}/${repositoryName}/collaborators/${collaboratorData.username}`;

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
      // Validate token before proceeding
      await this.ensureValidToken();

      // GitHub REST API endpoint to remove a collaborator
      const url = `${GITHUB_API_URL}/repos/${repositoryOwner}/${repositoryName}/collaborators/${username}`;

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
      // Validate token before proceeding
      await this.ensureValidToken();

      const { data, error } = await this.client
        .query(
          GetUserRepositoriesDocument,
          {},
          {
            name: OPERATIONS.GET_USER_REPOSITORIES,
          }
        )
        .toPromise();

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

  /**
   * Create a new repository using GitHub's GraphQL API
   */
  async createRepository(
    name: string,
    description: string = "",
    visibility: "PUBLIC" | "PRIVATE" = "PRIVATE"
  ): Promise<Repository | undefined> {
    // Validate token before proceeding
    await this.ensureValidToken();

    try {
      // Using fetch directly for the mutation since we don't have a generated document
      const response = await fetch(GITHUB_GRAPHQL_API_URL, {
        method: "POST",
        headers: {
          Authorization: `bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation CreateRepository($input: CreateRepositoryInput!) {
              createRepository(input: $input) {
                repository {
                  id
                  name
                  description
                  url
                  owner {
                    login
                    avatarUrl
                  }
                  createdAt
                }
              }
            }
          `,
          variables: {
            input: {
              name,
              description,
              visibility,
              clientMutationId: `create-repo-${Date.now()}`,
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        const errorMessage = result.errors[0]?.message || "Unknown GraphQL error";
        throw new Error(`Failed to create repository: ${errorMessage}`);
      }

      if (!result.data?.createRepository?.repository) {
        return undefined;
      }

      const repo = result.data.createRepository.repository;
      return {
        id: repo.id,
        name: repo.name,
        description: repo.description || undefined,
        html_url: repo.url,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatarUrl,
        },
        createdAt: repo.createdAt,
        collaborators: undefined,
      };
    } catch (error) {
      console.error("Error creating repository:", error);
      throw error;
    }
  }
}

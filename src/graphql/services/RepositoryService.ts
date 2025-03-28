/**
 * Repository Service
 *
 * Service class to handle all repository-related operations.
 * Uses the GraphQL API for repository queries.
 */
import { gql } from "urql";

import { GITHUB_API_URL } from "@/constants/github";
import { OPERATIONS } from "@/constants/operations";

import { RepositoryCollaboratorFormData, Repository, RepositoryCollaborator } from "../../types";
import { client } from "../client";
import { Repository as GraphQLRepository } from "../generated/graphql";

import { userService } from "./UserService";

// Define GraphQL document constants manually
const GetRepositoryDocument = gql`
  query GetRepository($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      name
      description
      url
      createdAt
      owner {
        login
        avatarUrl
      }
      isPrivate
      collaborators(first: 100) {
        nodes {
          id
          login
          avatarUrl
        }
        edges {
          permission
        }
      }
      projectsV2(first: 10) {
        nodes {
          id
          title
          number
          url
        }
      }
    }
  }
`;

const GetUserRepositoriesDocument = gql`
  query GetUserRepositories($first: Int = 100) {
    viewer {
      repositories(first: $first, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          id
          name
          description
          url
          createdAt
          isPrivate
          owner {
            login
            avatarUrl
          }
        }
      }
    }
  }
`;

const CreateRepositoryDocument = gql`
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
`;

/**
 * Service for managing GitHub repositories and their collaborators
 */
export class RepositoryService {
  private client = client;

  // Helper for token validation
  private get token(): string {
    return userService.getToken() || "";
  }

  private async ensureValidToken(): Promise<void> {
    return userService.ensureValidToken();
  }

  /**
   * Map GraphQL repository to Repository type
   */
  private mapGraphQLRepositoryToRepository(repo: GraphQLRepository): Repository {
    // Extract collaborators if they exist in the response
    let collaborators: RepositoryCollaborator[] | undefined = undefined;

    if (repo.collaborators?.nodes && repo.collaborators?.edges) {
      const nodes = repo.collaborators.nodes.filter((node) => node !== null);
      const edges = repo.collaborators.edges;

      if (nodes.length > 0) {
        collaborators = nodes.map((node, index) => ({
          id: node.id,
          login: node.login,
          avatarUrl: node.avatarUrl,
          permission: edges[index]?.permission || "read",
        }));
        console.log(`Mapped ${collaborators.length} collaborators for ${repo.name}`);
      }
    }

    // Log linked projects if they exist, but don't add to returned object
    // as the Property type doesn't include this yet
    if (repo.projectsV2?.nodes && repo.projectsV2.nodes.length > 0) {
      const linkedProjects = repo.projectsV2.nodes
        .filter((node) => node !== null)
        .map((node) => ({
          id: node.id,
          title: node.title,
          number: node.number,
          url: node.url,
        }));

      console.log(
        `Repository ${repo.name} is linked to ${linkedProjects.length} projects:`,
        linkedProjects.map((p) => p.title).join(", ")
      );
    }

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
      collaborators: collaborators,
    };
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

      if (!result.data?.repository) {
        return undefined;
      }

      return this.mapGraphQLRepositoryToRepository(result.data.repository as GraphQLRepository);
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
      await this.ensureValidToken();

      // Define GetRepoCollaborators as a GraphQL query
      const GetRepoCollaboratorsDocument = gql`
        query GetRepoCollaborators($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            collaborators(first: 100) {
              nodes {
                id
                login
                avatarUrl
              }
              edges {
                permission
              }
            }
          }
        }
      `;

      // Define the expected types for the GraphQL response
      interface CollaboratorNode {
        id: string;
        login: string;
        avatarUrl: string;
      }

      interface PermissionEdge {
        permission: string;
      }

      // Use GraphQL for collaborators to maintain consistency with other operations
      const { data, error } = await this.client
        .query(
          GetRepoCollaboratorsDocument,
          { owner, name },
          { name: OPERATIONS.GET_REPO_COLLABORATORS(owner, name) }
        )
        .toPromise();

      if (error) {
        console.error("Error fetching collaborators:", error);
        return [];
      }

      if (!data?.repository?.collaborators) {
        return [];
      }

      // GitHub GraphQL API returns nodes and edges separately, we need to combine them
      const nodes = (data.repository.collaborators.nodes || []) as (CollaboratorNode | null)[];
      const edges = (data.repository.collaborators.edges || []) as PermissionEdge[];

      // If we have collaborators, map them to our standard format
      if (nodes.length > 0) {
        return nodes
          .filter((node): node is CollaboratorNode => node !== null)
          .map((node: CollaboratorNode, index: number) => ({
            id: node.id,
            login: node.login,
            avatarUrl: node.avatarUrl,
            permission: edges[index]?.permission || "read",
          }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching repository collaborators:", error);
      return [];
    }
  }

  /**
   * Add a collaborator to a repository
   */
  async addRepositoryCollaborator(
    repositoryOwner: string,
    repositoryName: string,
    collaboratorData: RepositoryCollaboratorFormData
  ): Promise<boolean> {
    try {
      await this.ensureValidToken();

      // First, get the repository ID
      const repository = await this.getRepository(repositoryOwner, repositoryName);
      if (!repository) {
        throw new Error(`Repository ${repositoryOwner}/${repositoryName} not found`);
      }

      // Use the REST API to add collaborator since the GraphQL mutation is problematic
      const { username, permission } = collaboratorData;
      const url = `${GITHUB_API_URL}/repos/${repositoryOwner}/${repositoryName}/collaborators/${username}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `token ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({ permission }),
      });

      if (response.status === 204) {
        // 204 means the invitation was sent but requires acceptance
        return true;
      }

      if (!response.ok) {
        throw new Error(`Failed to add collaborator: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error adding repository collaborator:", error);
      throw error;
    }
  }

  /**
   * Get repositories for the current user
   */
  async getUserRepositories(): Promise<Repository[]> {
    try {
      await this.ensureValidToken();

      const { data, error } = await this.client
        .query(GetUserRepositoriesDocument, {}, { name: OPERATIONS.GET_USER_REPOSITORIES })
        .toPromise();

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.viewer || !data.viewer.repositories || !data.viewer.repositories.nodes) {
        return [];
      }

      // Repository node type for type-safety
      interface RepoNode {
        id: string;
        name: string;
        description: string | null;
        url: string;
        createdAt: string;
        owner: {
          login: string;
          avatarUrl: string;
        };
      }

      // Map GraphQL data to our app's Repository type
      return data.viewer.repositories.nodes
        .filter((node: RepoNode | null): node is RepoNode => node !== null)
        .map((repo: RepoNode) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description || undefined,
          html_url: repo.url,
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatarUrl,
          },
          createdAt: repo.createdAt,
        }));
    } catch (error) {
      console.error("Error fetching user repositories:", error);
      throw error;
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(
    name: string,
    description: string = "",
    visibility: "PUBLIC" | "PRIVATE" = "PRIVATE"
  ): Promise<Repository | undefined> {
    try {
      await this.ensureValidToken();

      // Map visibility strings to GraphQL enum values
      const visibilityValue = visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC";

      // Use GraphQL mutation to create repository
      const { data, error } = await this.client
        .mutation(
          CreateRepositoryDocument,
          {
            input: {
              name,
              description,
              visibility: visibilityValue,
            },
          },
          { name: OPERATIONS.CREATE_REPOSITORY }
        )
        .toPromise();

      if (error || !data?.createRepository?.repository) {
        console.error("Error creating repository via GraphQL:", error);
        throw new Error(`Failed to create repository: ${error?.message || "Unknown error"}`);
      }

      const repo = data.createRepository.repository;

      // Return the newly created repository
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
      };
    } catch (error) {
      console.error("Error creating repository:", error);
      throw error;
    }
  }

  /**
   * Remove a collaborator from a repository
   */
  async removeRepositoryCollaborator(
    repositoryOwner: string,
    repositoryName: string,
    username: string
  ): Promise<boolean> {
    try {
      await this.ensureValidToken();

      const url = `${GITHUB_API_URL}/repos/${repositoryOwner}/${repositoryName}/collaborators/${username}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `token ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to remove collaborator: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error removing repository collaborator:", error);
      throw error;
    }
  }

  /**
   * Delete a repository
   */
  async deleteRepository(owner: string, name: string): Promise<boolean> {
    try {
      await this.ensureValidToken();

      // Use the REST API to delete the repository
      const url = `${GITHUB_API_URL}/repos/${owner}/${name}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `token ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete repository: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting repository:", error);
      throw error;
    }
  }
}

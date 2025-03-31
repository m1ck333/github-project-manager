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

import { appInitializationService } from "./AppInitializationService";
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
 * Service for interacting with GitHub repositories
 */
export class RepositoryService {
  /**
   * Get a repository by owner and name
   */
  async getRepository(owner: string, name: string): Promise<Repository | null> {
    return appInitializationService.getRepository(owner, name);
  }

  /**
   * Get all repositories for the authenticated user
   */
  async getRepositories(): Promise<Repository[]> {
    return appInitializationService.getRepositories();
  }

  /**
   * Get collaborators for a repository
   */
  async getRepositoryCollaborators(owner: string, name: string): Promise<RepositoryCollaborator[]> {
    try {
      await userService.ensureValidToken();

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
      const { data, error } = await client
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
      await userService.ensureValidToken();

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
          Authorization: `token ${userService.getToken() || ""}`,
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
   * Create a new repository
   */
  async createRepository(
    name: string,
    description: string = "",
    visibility: "PUBLIC" | "PRIVATE" = "PRIVATE"
  ): Promise<Repository | undefined> {
    try {
      await userService.ensureValidToken();

      // Map visibility strings to GraphQL enum values
      const visibilityValue = visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC";

      // Use GraphQL mutation to create repository
      const { data, error } = await client
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
      await userService.ensureValidToken();

      const url = `${GITHUB_API_URL}/repos/${repositoryOwner}/${repositoryName}/collaborators/${username}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `token ${userService.getToken() || ""}`,
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
      await userService.ensureValidToken();

      // Use the REST API to delete the repository
      const url = `${GITHUB_API_URL}/repos/${owner}/${name}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `token ${userService.getToken() || ""}`,
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

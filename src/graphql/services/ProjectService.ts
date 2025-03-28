/**
 * Project Service
 *
 * Service class to handle all project-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { gql } from "urql";

import { OPERATIONS } from "../../constants/operations";
import { Project, ProjectFormData, Repository } from "../../types";
import { client } from "../client";

// Define GraphQL document constants
const GetProjectDocument = gql`
  query GetProject($id: ID!) {
    node(id: $id) {
      ... on ProjectV2 {
        id
        title
        shortDescription
        url
        createdAt
        updatedAt
        repositories(first: 10) {
          nodes {
            id
            name
            url
            owner {
              login
              avatarUrl
            }
          }
        }
      }
    }
  }
`;

const GetProjectsDocument = gql`
  query GetProjects {
    viewer {
      projectsV2(first: 20) {
        nodes {
          id
          title
          shortDescription
          url
          createdAt
          updatedAt
          repositories(first: 10) {
            nodes {
              id
              name
              url
              owner {
                login
                avatarUrl
              }
            }
          }
        }
      }
    }
  }
`;

const CreateProjectDocument = gql`
  mutation CreateProject($input: CreateProjectV2Input!) {
    createProjectV2(input: $input) {
      projectV2 {
        id
        title
        shortDescription
        url
        createdAt
        updatedAt
      }
    }
  }
`;

const UpdateProjectDocument = gql`
  mutation UpdateProject($input: UpdateProjectV2Input!) {
    updateProjectV2(input: $input) {
      projectV2 {
        id
        title
        shortDescription
        url
        createdAt
        updatedAt
      }
    }
  }
`;

const DeleteProjectDocument = gql`
  mutation DeleteProject($input: DeleteProjectV2Input!) {
    deleteProjectV2(input: $input) {
      clientMutationId
    }
  }
`;

/**
 * Service for interacting with GitHub GraphQL API for Projects
 */
export class ProjectService {
  private client = client;
  // Add a cache variable for projects
  private projectsCache: Project[] | null = null;
  private lastProjectsFetch: number = 0;
  private CACHE_TTL = 60000; // 1 minute cache TTL in milliseconds

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await this.client
      .query(GetProjectDocument, { id }, { name: OPERATIONS.GET_PROJECT(id) })
      .toPromise();

    if (error || !data?.node) {
      console.error("Error getting project by ID:", error);
      return null;
    }

    const project = transformProjectData(data.node);
    return transformProjectV2ToProject(project);
  }

  /**
   * Get all projects for the authenticated user
   * Using cache to avoid refetching within the TTL
   */
  async getProjects(skipCache = false): Promise<Project[]> {
    // Check if we have a valid cache
    const now = Date.now();
    if (!skipCache && this.projectsCache && now - this.lastProjectsFetch < this.CACHE_TTL) {
      return this.projectsCache;
    }

    // Fetch projects if cache is invalid or skipCache is true
    try {
      const { data, error } = await this.client
        .query(GetProjectsDocument, {}, { name: OPERATIONS.GET_PROJECTS })
        .toPromise();

      if (error) {
        console.error("Error getting projects:", error);
        return [];
      }

      // Process projects data
      const projects =
        data?.viewer?.projectsV2?.nodes
          ?.filter((node: unknown) => node !== null)
          .map((projectV2: Record<string, unknown>) => {
            const project = transformProjectData(projectV2 as Record<string, unknown>);
            return transformProjectV2ToProject(project);
          }) || [];

      // Update cache
      this.projectsCache = projects;
      this.lastProjectsFetch = now;

      return projects;
    } catch (error) {
      console.error("Error in getProjects:", error);
      return [];
    }
  }

  /**
   * Validate if the user has a valid token
   */
  async validateToken(): Promise<boolean> {
    const viewerQuery = gql`
      query GetViewer {
        viewer {
          login
        }
      }
    `;

    try {
      const { data, error } = await this.client
        .query(viewerQuery, {}, { name: OPERATIONS.VALIDATE_TOKEN })
        .toPromise();

      return !error && !!data?.viewer?.login;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData: ProjectFormData): Promise<Project | null> {
    // Get the current authenticated user ID using the viewer query
    const viewerQuery = gql`
      query GetViewer {
        viewer {
          id
          login
        }
      }
    `;

    // Get the current user ID
    const { data: viewerData, error: viewerError } = await this.client
      .query(viewerQuery, {}, { name: OPERATIONS.VALIDATE_TOKEN })
      .toPromise();

    if (viewerError || !viewerData?.viewer?.id) {
      console.error("Error getting authenticated user:", viewerError);
      return null;
    }

    const input = {
      ownerId: viewerData.viewer.id,
      title: projectData.name,
      ...(projectData.description ? { description: projectData.description } : {}),
    };

    const { data, error } = await this.client
      .mutation(CreateProjectDocument, { input }, { name: OPERATIONS.CREATE_PROJECT })
      .toPromise();

    if (error || !data?.createProjectV2?.projectV2) {
      console.error("Error creating project:", error);
      return null;
    }

    const createdProject = transformProjectData(data.createProjectV2.projectV2);
    return transformProjectV2ToProject(createdProject);
  }

  /**
   * Update a project
   */
  async updateProject(id: string, projectData: ProjectFormData): Promise<Project | null> {
    const input = {
      projectId: id,
      title: projectData.name,
    };

    const { data, error } = await this.client
      .mutation(UpdateProjectDocument, { input }, { name: OPERATIONS.UPDATE_PROJECT(id) })
      .toPromise();

    if (error || !data?.updateProjectV2?.projectV2) {
      console.error("Error updating project:", error);
      return null;
    }

    const updatedProject = transformProjectData(data.updateProjectV2.projectV2);
    return transformProjectV2ToProject(updatedProject);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<boolean | object> {
    const input = {
      projectId: id,
    };

    const { data, error } = await this.client
      .mutation(DeleteProjectDocument, { input }, { name: OPERATIONS.DELETE_PROJECT(id) })
      .toPromise();

    if (error) {
      console.error("Error deleting project:", error);
      return false;
    }

    // Return the actual data object if available, which will include {deleteProjectV2: {clientMutationId: null}}
    // This is more flexible than just checking if clientMutationId exists
    if (data && data.deleteProjectV2) {
      return data;
    }

    return false;
  }

  /**
   * Link a repository to a project
   */
  async linkRepositoryToProject(projectId: string, owner: string, name: string): Promise<boolean> {
    try {
      // Define the mutation if not imported
      const LinkRepositoryToProjectDocument = gql`
        mutation LinkRepositoryToProject($projectId: ID!, $repositoryId: ID!) {
          linkProjectV2ToRepository(input: { projectId: $projectId, repositoryId: $repositoryId }) {
            clientMutationId
            repository {
              id
              name
              url
            }
          }
        }
      `;

      // Need to lookup repo ID first by owner/name since API requires ID not string
      const RepoIdLookupQuery = gql`
        query GetRepoId($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            id
          }
        }
      `;

      // First, get the repository's node ID (GraphQL ID)
      const { data: repoData, error: repoError } = await this.client
        .query(RepoIdLookupQuery, { owner, name }, { name: OPERATIONS.GET_REPO_ID(owner, name) })
        .toPromise();

      if (repoError || !repoData?.repository?.id) {
        console.error("Error fetching repository ID:", repoError);
        return false;
      }

      const repositoryId = repoData.repository.id;

      // Now perform the link mutation with the correct ID
      const { data, error } = await this.client
        .mutation(
          LinkRepositoryToProjectDocument,
          {
            projectId,
            repositoryId,
          },
          { name: OPERATIONS.LINK_REPOSITORY_TO_PROJECT(projectId, owner + "/" + name) }
        )
        .toPromise();

      if (error) {
        console.error("Error linking repository to project:", error);
        return false;
      }

      // Check if the mutation was successful
      if (data?.linkProjectV2ToRepository?.repository) {
        console.log("Successfully linked repository to project:", data);

        // Invalidate projects cache to force refresh
        this.projectsCache = null;

        return true;
      } else {
        console.error("Failed to link repository to project:", data);
        return false;
      }
    } catch (error: unknown) {
      console.error("Error linking repository to project:", error);
      return false;
    }
  }
}

// Temporary helper function to transform project data until we fix the fragment issues
function transformProjectData(projectData: Record<string, unknown>): Record<string, unknown> {
  // Basic transformation without using fragments
  return {
    id: projectData.id,
    title: projectData.title,
    description: projectData.shortDescription || "",
    url: projectData.url?.toString() || "",
    html_url: projectData.url?.toString() || "",
    createdAt: projectData.createdAt ? projectData.createdAt.toString() : new Date().toISOString(),
    updatedAt: projectData.updatedAt ? projectData.updatedAt.toString() : new Date().toISOString(),
    // Default values for required fields
    createdBy: {
      login: "unknown",
      avatarUrl: "",
    },
    owner: {
      login: "unknown",
      avatar_url: "",
    },
    // Add repositories data if available
    repositories: projectData.repositories
      ? ((projectData.repositories as Record<string, unknown>).nodes as unknown[])?.map((repo) => {
          return {
            id: (repo as Record<string, unknown>).id,
            name: (repo as Record<string, unknown>).name,
            html_url: (repo as Record<string, unknown>).url,
            owner: {
              login:
                ((repo as Record<string, unknown>).owner as Record<string, unknown>)?.login ||
                "unknown",
              avatar_url:
                ((repo as Record<string, unknown>).owner as Record<string, unknown>)?.avatarUrl ||
                "",
            },
          };
        })
      : [],
  };
}

// Helper function to convert from internal project format to the application Project type
function transformProjectV2ToProject(projectData: Record<string, unknown>): Project {
  return {
    id: projectData.id as string,
    name: projectData.title as string,
    description: projectData.description as string | undefined,
    html_url: projectData.url as string,
    createdAt: projectData.createdAt as string,
    updatedAt: projectData.updatedAt as string,
    url: projectData.url as string,
    createdBy: {
      login: ((projectData.createdBy as Record<string, unknown>)?.login as string) || "unknown",
      avatarUrl: ((projectData.createdBy as Record<string, unknown>)?.avatarUrl as string) || "",
    },
    owner: {
      login: ((projectData.owner as Record<string, unknown>)?.login as string) || "unknown",
      avatar_url: ((projectData.owner as Record<string, unknown>)?.avatar_url as string) || "",
    },
    repositories: projectData.repositories as Repository[] | undefined,
  };
}

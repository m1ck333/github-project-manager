/**
 * Project Service
 *
 * Handles all interactions with GitHub Projects V2
 */
import { gql } from "urql";

import { OPERATIONS } from "../../constants/operations";
import { Project, ProjectFormData } from "../../types";
import { client } from "../client";
import {
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  LinkRepositoryToProjectDocument,
} from "../operations/operation-names";

import { appInitializationService } from "./AppInitializationService";

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

// Import the new GetProjectDetails query
const GetProjectDetailsDocument = gql`
  query GetProjectDetails($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        id
        title
        shortDescription
        url
        createdAt
        updatedAt

        # Project Fields including Status Field (columns)
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options {
                id
                name
                color
              }
            }
          }
        }

        # Project Items (issues, PRs, etc.)
        items(first: 100) {
          nodes {
            id
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldDateValue {
                  date
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                  optionId
                }
              }
            }
            content {
              ... on Issue {
                id
                title
                number
                body
                url
                repository {
                  id
                  name
                }
                labels(first: 10) {
                  nodes {
                    id
                    name
                    color
                  }
                }
                assignees(first: 5) {
                  nodes {
                    login
                    avatarUrl
                  }
                }
              }
            }
          }
        }

        # Project Repositories
        repositories(first: 10) {
          nodes {
            id
            name
            url
            owner {
              login
              avatarUrl
            }
            # Repository Labels
            labels(first: 50) {
              nodes {
                id
                name
                color
                description
              }
            }
            collaborators(first: 10) {
              edges {
                permission
                node {
                  login
                  avatarUrl
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Add the new simplified query
const GetProjectColumnsAndIssuesDocument = gql`
  query GetProjectColumnsAndIssues($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        id
        title

        # Get Status field (which contains the columns)
        field(name: "Status") {
          ... on ProjectV2SingleSelectField {
            id
            name
            options {
              id
              name
            }
          }
        }

        # Get project items (issues)
        items(first: 100) {
          nodes {
            id
            # Get field values including the status value
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                  optionId
                }
              }
            }
            # Get the issue content
            content {
              ... on Issue {
                id
                title
                number
                body
                url
                labels(first: 10) {
                  nodes {
                    id
                    name
                    color
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Service for interacting with GitHub GraphQL API for Projects
 */
export class ProjectService {
  private client = client;

  /**
   * Get a project by ID - uses appInitializationService
   */
  async getProject(id: string): Promise<Project | null> {
    const project = appInitializationService.getProjectById(id);
    if (project) {
      return project;
    }

    // If we couldn't find the project, return null
    console.warn(`Project with ID ${id} not found in initialized data`);
    return null;
  }

  /**
   * Get all projects for the authenticated user - uses appInitializationService
   */
  async getProjects(_skipCache = false): Promise<Project[]> {
    return appInitializationService.getProjects();
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
   * @param projectId The ID of the project
   * @param repositoryOwner The owner of the repository
   * @param repositoryName The name of the repository
   * @returns A boolean indicating success
   */
  async linkRepositoryToProject(
    projectId: string,
    repositoryOwner: string,
    repositoryName: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .mutation(LinkRepositoryToProjectDocument, {
          projectId,
          repositoryName,
          repositoryOwner,
        })
        .toPromise();

      if (error || !data?.linkProjectV2ToRepository) {
        return false;
      }

      // Clear the projects cache to ensure fresh data next time
      this.projectsCache = null;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get project details - uses appInitializationService
   */
  async getProjectDetails(id: string): Promise<Project | null> {
    const project = appInitializationService.getProjectById(id);
    if (project) {
      return project;
    }

    console.warn(`Project details for ID ${id} not found in initialized data`);
    return null;
  }

  /**
   * Get project columns and issues - uses appInitializationService
   */
  async getProjectColumnsAndIssues(id: string): Promise<{ columns: any[]; issues: any[] }> {
    const project = appInitializationService.getProjectById(id);
    if (project) {
      return {
        columns: project.columns || [],
        issues: project.issues || [],
      };
    }

    console.warn(`Project columns and issues for ID ${id} not found in initialized data`);
    return {
      columns: [],
      issues: [],
    };
  }

  /**
   * Map column name to column type
   */
  private mapColumnTypeFromName(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("todo") || lowerName.includes("to do")) {
      return "TODO";
    } else if (lowerName.includes("progress")) {
      return "IN_PROGRESS";
    } else if (lowerName.includes("done") || lowerName.includes("complete")) {
      return "DONE";
    } else if (lowerName.includes("backlog")) {
      return "BACKLOG";
    }
    return "TODO"; // Default type
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

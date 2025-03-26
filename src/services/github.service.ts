import { client } from "../api/client";
import { gql } from "urql";
import { Project } from "../types";

export class GitHubService {
  private client;

  constructor() {
    this.client = client;
  }

  async getProjects(): Promise<Project[]> {
    // Define the query for fetching projects
    const query = gql`
      query GetProjectsV2 {
        viewer {
          projectsV2(first: 10) {
            nodes {
              id
              title
              shortDescription
              url
              owner {
                ... on User {
                  login
                  avatarUrl
                }
                ... on Organization {
                  login
                  avatarUrl
                }
              }
              items(first: 10) {
                nodes {
                  id
                  content {
                    ... on Issue {
                      id
                      title
                      body
                      state
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
      }
    `;

    const result = await this.client.query(query, {}).toPromise();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Map the V2 projects to maintain compatibility with existing code
    const projectsV2 = result.data?.viewer?.projectsV2?.nodes || [];

    interface ProjectV2Node {
      id: string;
      title: string;
      shortDescription?: string;
      url: string;
      owner: {
        login: string;
        avatarUrl: string;
      };
    }

    return (
      projectsV2.map((projectV2: ProjectV2Node) => ({
        id: projectV2.id, // Store the original GitHub ID
        name: projectV2.title,
        description: projectV2.shortDescription || "",
        html_url: projectV2.url,
        owner: {
          login: projectV2.owner.login,
          avatar_url: projectV2.owner.avatarUrl,
        },
      })) || []
    );
  }

  async createProject(name: string): Promise<Project> {
    // First, get the viewer (logged-in user) to get their ID
    const viewerQuery = `
      query {
        viewer {
          id
          login
        }
      }
    `;

    const viewerResult = await this.client.query(viewerQuery, {}).toPromise();
    const ownerId = viewerResult.data?.viewer?.id;

    if (!ownerId) {
      throw new Error("Failed to get viewer ID");
    }

    const mutation = `
      mutation CreateProjectV2($name: String!, $ownerId: ID!) {
        createProjectV2(input: { ownerId: $ownerId, title: $name }) {
          projectV2 {
            id
            title
            url
            ... on ProjectV2 {
              owner {
                ... on User {
                  login
                  avatarUrl
                }
                ... on Organization {
                  login
                  avatarUrl
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.client.mutation(mutation, { name, ownerId }).toPromise();

    if (result.error) {
      throw new Error(result.error.message);
    }

    const projectData = result.data.createProjectV2.projectV2;

    return {
      id: projectData.id, // Store the original GitHub ID
      name: projectData.title,
      description: "",
      html_url: projectData.url,
      owner: {
        login: projectData.owner.login,
        avatar_url: projectData.owner.avatarUrl,
      },
    };
  }

  // Helper method to extract node ID from a project
  private getProjectNodeId(projectId: string | number): string {
    // If it's already a full node ID, return as is
    if (typeof projectId === "string") {
      return projectId;
    }

    throw new Error("Invalid project ID format");
  }

  async updateProject(projectId: string, name: string, description: string): Promise<Project> {
    const projectNodeId = this.getProjectNodeId(projectId);

    const mutation = gql`
      mutation UpdateProjectV2($projectId: ID!, $title: String!) {
        updateProjectV2(input: { projectId: $projectId, title: $title }) {
          projectV2 {
            id
            title
            url
            owner {
              ... on User {
                login
                avatarUrl
              }
              ... on Organization {
                login
                avatarUrl
              }
            }
          }
        }
      }
    `;

    const updateResult = await this.client
      .mutation(mutation, { projectId: projectNodeId, title: name })
      .toPromise();

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }

    // Map the response to maintain compatibility with existing code
    if (updateResult.data?.updateProjectV2?.projectV2) {
      const projectData = updateResult.data.updateProjectV2.projectV2;
      return {
        id: projectData.id,
        name: projectData.title,
        description: description || "",
        html_url: projectData.url,
        owner: {
          login: projectData.owner.login,
          avatar_url: projectData.owner.avatarUrl,
        },
      };
    }

    throw new Error("Failed to update project");
  }

  async deleteProject(projectId: string): Promise<void> {
    const projectNodeId = this.getProjectNodeId(projectId);

    const mutation = gql`
      mutation DeleteProjectV2($projectId: ID!) {
        deleteProjectV2(input: { projectId: $projectId }) {
          clientMutationId
        }
      }
    `;

    const deleteResult = await this.client
      .mutation(mutation, { projectId: projectNodeId })
      .toPromise();

    if (deleteResult.error) {
      throw new Error(deleteResult.error.message);
    }
  }

  // Static methods maintained for backward compatibility
  static async getProjects() {
    const service = new GitHubService();
    return service.getProjects();
  }

  static async createProject(name: string) {
    const service = new GitHubService();
    return service.createProject(name);
  }

  static async updateProject(projectId: string | number, title: string, description: string = "") {
    const service = new GitHubService();
    return service.updateProject(projectId.toString(), title, description);
  }

  static async deleteProject(projectId: string | number) {
    const service = new GitHubService();
    await service.deleteProject(projectId.toString());
    return true;
  }

  static async createBoard(projectId: string | number, name: string) {
    const service = new GitHubService();
    const projectNodeId = service.getProjectNodeId(projectId.toString());

    const mutation = gql`
      mutation CreateBoard($projectId: ID!, $name: String!) {
        createProjectV2Field(input: { projectId: $projectId, name: $name }) {
          projectV2Field {
            id
            name
          }
        }
      }
    `;

    const result = await service.client
      .mutation(mutation, { projectId: projectNodeId, name })
      .toPromise();
    return result.data?.createProjectV2Field.projectV2Field;
  }

  static async createLabel(
    projectId: string | number,
    name: string,
    color: string,
    description?: string
  ) {
    const service = new GitHubService();
    const projectNodeId = service.getProjectNodeId(projectId.toString());

    const mutation = gql`
      mutation CreateLabel($projectId: ID!, $name: String!, $color: String!, $description: String) {
        createLabel(
          input: { repositoryId: $projectId, name: $name, color: $color, description: $description }
        ) {
          label {
            id
            name
            color
            description
          }
        }
      }
    `;

    const result = await service.client
      .mutation(mutation, {
        projectId: projectNodeId,
        name,
        color,
        description,
      })
      .toPromise();
    return result.data?.createLabel.label;
  }

  static async createIssue(
    projectId: string | number,
    title: string,
    description?: string,
    labels: string[] = []
  ) {
    const service = new GitHubService();
    const projectNodeId = service.getProjectNodeId(projectId.toString());

    const mutation = gql`
      mutation CreateIssue(
        $projectId: ID!
        $title: String!
        $description: String
        $labels: [String!]
      ) {
        createIssue(
          input: { repositoryId: $projectId, title: $title, body: $description, labelIds: $labels }
        ) {
          issue {
            id
            title
            body
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
    `;

    const result = await service.client
      .mutation(mutation, {
        projectId: projectNodeId,
        title,
        description,
        labels,
      })
      .toPromise();
    return result.data?.createIssue.issue;
  }

  static async updateIssueState(issueId: string, state: string) {
    const service = new GitHubService();

    const mutation = gql`
      mutation UpdateIssueState($issueId: ID!, $state: IssueState!) {
        updateIssue(input: { id: $issueId, state: $state }) {
          issue {
            id
            state
          }
        }
      }
    `;

    const result = await service.client.mutation(mutation, { issueId, state }).toPromise();
    return result.data?.updateIssue.issue;
  }

  static async addCollaborator(projectId: string | number, userId: string, role: string) {
    const service = new GitHubService();
    const projectNodeId = service.getProjectNodeId(projectId.toString());

    const mutation = gql`
      mutation AddCollaborator($projectId: ID!, $userId: ID!, $role: ProjectV2Collaborator!) {
        addProjectV2Collaborator(input: { projectId: $projectId, userId: $userId, role: $role }) {
          projectV2 {
            id
            collaborators {
              nodes {
                user {
                  id
                  login
                  avatarUrl
                }
                role
              }
            }
          }
        }
      }
    `;

    const result = await service.client
      .mutation(mutation, {
        projectId: projectNodeId,
        userId,
        role,
      })
      .toPromise();

    return result.data?.addProjectV2Collaborator.projectV2;
  }
}

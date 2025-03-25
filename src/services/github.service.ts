import { client } from "../api/client";
import { gql } from "urql";
import { Project } from "../types";

export class GitHubService {
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

    const result = await client.query(query, {}).toPromise();

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
        id: parseInt(projectV2.id.split("_").pop() || "0"),
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

  async createProject(name: string, description: string): Promise<Project> {
    const mutation = gql`
      mutation CreateProjectV2($name: String!, $ownerId: ID!) {
        createProjectV2(input: { ownerId: $ownerId, title: $name }) {
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

    // Get the user ID from viewer query
    const viewerQuery = gql`
      query GetViewer {
        viewer {
          id
        }
      }
    `;

    const viewerResult = await client.query(viewerQuery, {}).toPromise();
    if (viewerResult.error) {
      throw new Error(viewerResult.error.message);
    }

    const ownerId = viewerResult.data?.viewer?.id;
    const result = await client.mutation(mutation, { name, ownerId });

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Map the response to maintain compatibility with existing code
    if (result.data?.createProjectV2?.projectV2) {
      const projectData = result.data.createProjectV2.projectV2;
      return {
        id: parseInt(projectData.id.split("_").pop() || "0"),
        name: projectData.title,
        description: description || "",
        html_url: projectData.url,
        owner: {
          login: projectData.owner.login,
          avatar_url: projectData.owner.avatarUrl,
        },
      };
    }

    throw new Error("Failed to create project");
  }

  async updateProject(projectId: number, name: string, description: string): Promise<Project> {
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

    const stringId = `ProjectV2_${projectId}`;
    const result = await client.mutation(mutation, { projectId: stringId, title: name });

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Map the response to maintain compatibility with existing code
    if (result.data?.updateProjectV2?.projectV2) {
      const projectData = result.data.updateProjectV2.projectV2;
      return {
        id: parseInt(projectData.id.split("_").pop() || "0"),
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

  async deleteProject(projectId: number): Promise<void> {
    const mutation = gql`
      mutation DeleteProjectV2($projectId: ID!) {
        deleteProjectV2(input: { projectId: $projectId }) {
          clientMutationId
        }
      }
    `;

    const stringId = `ProjectV2_${projectId}`;
    const result = await client.mutation(mutation, { projectId: stringId });

    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  // Static methods maintained for backward compatibility
  static async getProjects() {
    const service = new GitHubService();
    return service.getProjects();
  }

  static async createProject(name: string, description: string = "") {
    const service = new GitHubService();
    return service.createProject(name, description);
  }

  static async updateProject(projectId: string | number, title: string, description: string = "") {
    const service = new GitHubService();
    const numericId =
      typeof projectId === "string" ? parseInt(projectId.split("_").pop() || "0") : projectId;
    return service.updateProject(numericId, title, description);
  }

  static async deleteProject(projectId: string | number) {
    const service = new GitHubService();
    const numericId =
      typeof projectId === "string" ? parseInt(projectId.split("_").pop() || "0") : projectId;
    await service.deleteProject(numericId);
    return true;
  }

  static async createBoard(projectId: string, name: string) {
    const mutation = gql`
      mutation CreateBoard($projectId: ID!, $name: String!) {
        createProjectV2(input: { projectId: $projectId, name: $name }) {
          projectV2 {
            id
            name
          }
        }
      }
    `;

    const result = await client.mutation(mutation, { projectId, name });
    return result.data?.createProjectV2.projectV2;
  }

  static async createLabel(projectId: string, name: string, color: string, description?: string) {
    const mutation = gql`
      mutation CreateLabel($projectId: ID!, $name: String!, $color: String!, $description: String) {
        createLabel(
          input: { projectId: $projectId, name: $name, color: $color, description: $description }
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

    const result = await client.mutation(mutation, {
      projectId,
      name,
      color,
      description,
    });
    return result.data?.createLabel.label;
  }

  static async createIssue(
    projectId: string,
    title: string,
    description?: string,
    labels: string[] = []
  ) {
    const mutation = gql`
      mutation CreateIssue(
        $projectId: ID!
        $title: String!
        $description: String
        $labels: [String!]
      ) {
        createIssue(
          input: {
            projectId: $projectId
            title: $title
            description: $description
            labels: $labels
          }
        ) {
          issue {
            id
            title
            description
            labels {
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

    const result = await client.mutation(mutation, {
      projectId,
      title,
      description,
      labels,
    });
    return result.data?.createIssue.issue;
  }

  static async updateIssueState(issueId: string, state: string) {
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

    const result = await client.mutation(mutation, { issueId, state });
    return result.data?.updateIssue.issue;
  }

  static async addCollaborator(projectId: string, userId: string, role: string) {
    const mutation = gql`
      mutation AddCollaborator($projectId: ID!, $userId: ID!, $role: ProjectRole!) {
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

    const result = await client.mutation(mutation, { projectId, userId, role });
    return result.data?.addProjectV2Collaborator.projectV2;
  }
}

import { client } from "../api/client";
import { gql } from "urql";

export class GitHubService {
  static async createProject(name: string) {
    const mutation = gql`
      mutation CreateProjectV2($name: String!, $ownerId: ID!) {
        createProjectV2(input: { ownerId: $ownerId, title: $name }) {
          projectV2 {
            id
            title
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

    // Map the response to maintain compatibility with existing code
    if (result.data?.createProjectV2?.projectV2) {
      return {
        id: result.data.createProjectV2.projectV2.id,
        name: result.data.createProjectV2.projectV2.title,
        boards: [],
        collaborators: [],
      };
    }

    return null;
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

  static async getProjects() {
    const query = gql`
      query GetProjectsV2 {
        viewer {
          projectsV2(first: 10) {
            nodes {
              id
              title
              shortDescription
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
              collaborators: collaborators(first: 10) {
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
      items?: { nodes: Array<{ id: string }> };
      collaborators?: {
        nodes: Array<{ user: { id: string; login: string; avatarUrl: string }; role: string }>;
      };
    }

    return (
      projectsV2.map((projectV2: ProjectV2Node) => ({
        id: projectV2.id,
        name: projectV2.title,
        description: projectV2.shortDescription,
        boards: [], // ProjectV2 doesn't have direct boards - would need different modeling
        collaborators: projectV2.collaborators?.nodes || [],
      })) || []
    );
  }
}

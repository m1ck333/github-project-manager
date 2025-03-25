import { client } from "../api/client";
import { gql } from "urql";

export class GitHubService {
  static async createProject(name: string, description?: string) {
    const mutation = gql`
      mutation CreateProject($name: String!, $description: String) {
        createProject(input: { name: $name, description: $description }) {
          project {
            id
            name
            description
          }
        }
      }
    `;

    const result = await client.mutation(mutation, { name, description });
    return result.data?.createProject.project;
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

  static async createLabel(
    projectId: string,
    name: string,
    color: string,
    description?: string
  ) {
    const mutation = gql`
      mutation CreateLabel(
        $projectId: ID!
        $name: String!
        $color: String!
        $description: String
      ) {
        createLabel(
          input: {
            projectId: $projectId
            name: $name
            color: $color
            description: $description
          }
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

  static async addCollaborator(
    projectId: string,
    userId: string,
    role: string
  ) {
    const mutation = gql`
      mutation AddCollaborator(
        $projectId: ID!
        $userId: ID!
        $role: ProjectRole!
      ) {
        addProjectV2Collaborator(
          input: { projectId: $projectId, userId: $userId, role: $role }
        ) {
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

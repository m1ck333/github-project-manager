/**
 * Issue Service
 *
 * Service class to handle all issue-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { gql } from "urql";

import { BoardIssue, Issue, Label } from "../../types";
import { client } from "../client";

// Define GraphQL documents
const GetProjectIssuesDocument = gql`
  query GetProjectIssues($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: 100) {
          nodes {
            id
            fieldValues(first: 8) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
              }
            }
            content {
              ... on Issue {
                id
                title
                number
                state
                body
                url
                createdAt
                updatedAt
                labels(first: 10) {
                  nodes {
                    id
                    name
                    color
                    description
                  }
                }
                author {
                  login
                  avatarUrl
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
      }
    }
  }
`;

const GetStatusFieldDocument = gql`
  query GetStatusField($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
              name
            }
          }
        }
      }
    }
  }
`;

const UpdateIssueStatusDocument = gql`
  mutation UpdateIssueStatus($projectId: ID!, $itemId: ID!, $fieldId: ID!, $valueId: String!) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { singleSelectOptionId: $valueId }
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`;

const CreateIssueDocument = gql`
  mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String) {
    createIssue(input: { repositoryId: $repositoryId, title: $title, body: $body }) {
      issue {
        id
        title
        number
      }
    }
  }
`;

const CreateDraftIssueDocument = gql`
  mutation CreateDraftIssue($projectId: ID!, $title: String!, $body: String) {
    createProjectV2DraftIssue(input: { projectId: $projectId, title: $title, body: $body }) {
      projectItem {
        id
      }
    }
  }
`;

// Type definitions for GraphQL responses
interface ProjectItem {
  id: string;
  fieldValues?: {
    nodes?: Array<{
      name?: string;
      field?: {
        name?: string;
      };
    } | null>;
  };
  content?: {
    id?: string;
    title?: string;
    number?: number;
    state?: string;
    body?: string;
    url?: string;
    createdAt?: string;
    updatedAt?: string;
    labels?: {
      nodes?: Array<LabelNode | null>;
    };
    author?: {
      login?: string;
      avatarUrl?: string;
    };
    assignees?: {
      nodes?: Array<{
        login?: string;
        avatarUrl?: string;
      } | null>;
    };
  };
}

interface LabelNode {
  id?: string;
  name?: string;
  color?: string;
  description?: string;
}

/**
 * Service for managing project issues
 */
export class IssueService {
  private client = client;

  /**
   * Get all issues for a project
   */
  async getIssues(projectId: string): Promise<Issue[]> {
    // Reuse the getProjectIssues method but flatten the result
    const boardIssues = await this.getProjectIssues(projectId);

    // Convert BoardIssue to Issue, filtering out any with undefined id
    return boardIssues
      .filter((issue) => issue.issueId) // Filter out issues without an issueId
      .map((issue) => ({
        id: issue.issueId!, // Non-null assertion since we filtered
        title: issue.title,
        body: issue.body,
        number: issue.number,
        state: issue.state,
        url: issue.url,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        labels: issue.labels,
      }));
  }

  /**
   * Get all issues for a project and organize them by column
   */
  async getProjectIssues(projectId: string): Promise<BoardIssue[]> {
    const { data, error } = await this.client
      .query(GetProjectIssuesDocument, { projectId })
      .toPromise();

    if (error || !data?.node) {
      console.error("Error fetching project issues:", error);
      return [];
    }

    if (data.node.__typename !== "ProjectV2" || !data.node.items?.nodes) {
      return [];
    }

    // Convert project items to our BoardIssue type
    return data.node.items.nodes
      .filter((node: ProjectItem | null): node is ProjectItem => {
        // Filter out null nodes and nodes without content
        if (!node || !node.content) return false;
        return true;
      })
      .map((node: ProjectItem) => {
        // Find the status field value
        const statusField = node.fieldValues?.nodes?.find(
          (field) => field?.field?.name === "Status"
        );
        const columnName = statusField?.name || "Todo";

        // Convert labels from GraphQL to our Label type
        const labels: Label[] =
          node.content?.labels?.nodes
            ?.filter((label: LabelNode | null): label is LabelNode => !!label)
            .map((label: LabelNode) => ({
              id: label.id || "",
              name: label.name || "",
              color: label.color || "",
              description: label.description || "",
            })) || [];

        // Create the BoardIssue object
        return {
          id: node.id,
          issueId: node.content?.id || "",
          number: node.content?.number || 0,
          title: node.content?.title || "",
          body: node.content?.body || "",
          state: node.content?.state || "OPEN",
          url: node.content?.url || "",
          createdAt: node.content?.createdAt || "",
          updatedAt: node.content?.updatedAt || "",
          columnName, // Store the column name for mapping to column ID later
          labels,
          author: node.content?.author
            ? {
                login: node.content.author.login || "",
                avatarUrl: node.content.author.avatarUrl || "",
              }
            : null,
          assignees:
            node.content?.assignees?.nodes
              ?.filter((assignee) => assignee !== null)
              .map((assignee) => ({
                login: assignee?.login || "",
                avatarUrl: assignee?.avatarUrl || "",
              })) || [],
        };
      });
  }

  /**
   * Get the Status field ID for a project
   */
  async getStatusFieldId(projectId: string): Promise<string | null> {
    const { data, error } = await this.client
      .query(GetStatusFieldDocument, { projectId })
      .toPromise();

    if (error || !data?.node) {
      console.error("Error fetching status field:", error);
      return null;
    }

    if (data.node.__typename !== "ProjectV2" || !data.node.fields?.nodes) {
      return null;
    }

    // Define the type for field nodes
    interface ProjectFieldNode {
      __typename?: string;
      id?: string;
      name?: string;
    }

    // Find the Status field
    const statusField = data.node.fields.nodes.find(
      (field: ProjectFieldNode) =>
        field?.__typename === "ProjectV2SingleSelectField" && field?.name === "Status"
    );

    if (!statusField) {
      console.error("Status field not found");
      return null;
    }

    return statusField.id;
  }

  /**
   * Update the status (column) of an issue
   */
  async updateIssueStatus(
    projectId: string,
    itemId: string,
    fieldId: string,
    valueId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .mutation(UpdateIssueStatusDocument, {
          projectId,
          itemId,
          fieldId,
          valueId,
        })
        .toPromise();

      if (error || !data?.updateProjectV2ItemFieldValue?.projectV2Item) {
        console.error("Error updating issue status:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Exception updating issue status:", err);
      return false;
    }
  }

  /**
   * Create a new issue in a repository
   */
  async createIssue(repositoryId: string, title: string, body?: string): Promise<string | null> {
    try {
      const { data, error } = await this.client
        .mutation(CreateIssueDocument, {
          repositoryId,
          title,
          body,
        })
        .toPromise();

      if (error || !data?.createIssue?.issue) {
        console.error("Error creating issue:", error);
        return null;
      }

      return data.createIssue.issue.id;
    } catch (err) {
      console.error("Exception creating issue:", err);
      return null;
    }
  }

  /**
   * Create a draft issue directly in a project
   */
  async createDraftIssue(projectId: string, title: string, body?: string): Promise<Issue | null> {
    try {
      const { data, error } = await this.client
        .mutation(CreateDraftIssueDocument, {
          projectId,
          title,
          body,
        })
        .toPromise();

      if (error || !data?.createProjectV2DraftIssue?.projectItem) {
        console.error("Error creating draft issue:", error);
        return null;
      }

      // Return a simplified issue object since draft issues don't have all the properties
      return {
        id: data.createProjectV2DraftIssue.projectItem.id,
        title: title,
        body: body || "",
        // Other properties will be undefined
      };
    } catch (err) {
      console.error("Exception creating draft issue:", err);
      return null;
    }
  }
}

export const issueService = new IssueService();

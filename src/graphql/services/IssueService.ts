/**
 * Issue Service
 *
 * Service class to handle all issue-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { gql } from "urql";

import { BoardIssue, Issue, Label } from "../../types";
import { client } from "../client";

import { appInitializationService } from "./AppInitializationService";

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

// Add new GraphQL documents for the missing operations
const GetProjectRepositoriesDocument = gql`
  query GetProjectRepositories($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        repositories(first: 10) {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`;

const UpdateIssueDocument = gql`
  mutation UpdateIssue($id: ID!, $title: String!, $body: String) {
    updateIssue(input: { id: $id, title: $title, body: $body }) {
      issue {
        id
        title
        body
      }
    }
  }
`;

const DeleteIssueDocument = gql`
  mutation DeleteIssue($issueId: ID!) {
    deleteIssue(input: { issueId: $issueId }) {
      clientMutationId
    }
  }
`;

// Add the AddProjectItemDocument after the other GraphQL document definitions
const AddProjectItemDocument = gql`
  mutation AddProjectItem($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item {
        id
      }
    }
  }
`;

// Type definitions for GraphQL responses
// Add repository node interface
interface RepositoryNode {
  id: string;
  name: string;
}

// Type definition for raw API label structure
interface RawLabel {
  id?: string;
  name?: string;
  color?: string;
  description?: string;
}

// Define the type for node data
interface ProjectNodeData {
  id: string;
  content?: Record<string, unknown>;
  fieldValues?: {
    nodes?: Array<Record<string, unknown> | null>;
  };
  [key: string]: unknown;
}

// Add interfaces for project nodes
interface ProjectItemNode {
  id: string;
  content?: {
    id?: string;
    title?: string;
    number?: number;
    body?: string;
    url?: string;
    labels?: {
      nodes?: Array<{
        id: string;
        name: string;
        color: string;
        description?: string;
      } | null>;
    };
  };
  fieldValues?: {
    nodes?: Array<{
      __typename?: string;
      name?: string;
      field?: {
        name: string;
      };
    } | null>;
  };
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
   * Get issues for a project - uses appInitializationService
   */
  async getProjectIssues(projectId: string): Promise<BoardIssue[]> {
    return appInitializationService.getProjectIssues(projectId);
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
    // Maximum number of retries
    const maxRetries = 3;
    // Initial delay in milliseconds
    const initialDelay = 1000;

    // Helper function to add delay
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Add exponential backoff delay starting from the second attempt
        if (attempt > 0) {
          const delayTime = initialDelay * Math.pow(2, attempt - 1);

          await delay(delayTime);
        }

        const { data, error } = await this.client
          .mutation(UpdateIssueStatusDocument, {
            projectId,
            itemId,
            fieldId,
            valueId,
          })
          .toPromise();

        if (error) {
          lastError = error;
          console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
          continue; // Try again
        }

        if (!data?.updateProjectV2ItemFieldValue?.projectV2Item) {
          lastError = new Error("No item returned from update issue status mutation");
          console.warn(`Attempt ${attempt + 1}/${maxRetries} failed: No item returned`);
          continue; // Try again
        }

        return true;
      } catch (err) {
        lastError = err;
        console.error(`Attempt ${attempt + 1}/${maxRetries} exception updating issue status:`, err);
        // Continue to next retry
      }
    }

    // All retries failed
    console.error("Error updating issue status after all retries:", lastError);
    return false;
  }

  /**
   * Create a new issue in a repository and add it to a project
   */
  async createIssue(
    repositoryId: string,
    title: string,
    body?: string,
    projectId?: string
  ): Promise<BoardIssue | null> {
    try {
      // First create the issue in the repository
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

      const issueId = data.createIssue.issue.id;
      const issueNumber = data.createIssue.issue.number;
      const issueTitle = data.createIssue.issue.title;

      // If a project ID is provided, add the issue to the project
      let projectItemId = null;
      if (projectId) {
        try {
          projectItemId = await this.addIssueToProject(projectId, issueId);
        } catch (addError) {
          console.error("Error adding issue to project:", addError);
          // Continue anyway since the issue was created
        }
      }

      // Return a BoardIssue with the basic information
      return {
        id: projectItemId || issueId, // Use project item ID if available
        issueId,
        title: issueTitle,
        number: issueNumber,
        body: body || "",
        // Use the first column by default, it will be updated after refresh
      };
    } catch (err) {
      console.error("Exception creating issue:", err);
      return null;
    }
  }

  /**
   * Add an issue to a project and return the project item ID
   * This method includes retries and delays to handle GitHub API's eventual consistency
   */
  async addIssueToProject(projectId: string, contentId: string): Promise<string | null> {
    // Maximum number of retries
    const maxRetries = 3;
    // Initial delay in milliseconds
    const initialDelay = 1000;

    // Helper function to add delay
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let lastError = null;

    // Try adding the issue to the project with retries
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Add exponential backoff delay starting from the second attempt
        if (attempt > 0) {
          const delayTime = initialDelay * Math.pow(2, attempt - 1);

          await delay(delayTime);
        }

        // Try to add the issue to the project
        const { data, error } = await this.client
          .mutation(AddProjectItemDocument, {
            projectId,
            contentId,
          })
          .toPromise();

        if (error) {
          lastError = error;
          console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
          continue; // Try again
        }

        if (!data?.addProjectV2ItemById?.item) {
          lastError = new Error("No item returned from add project item mutation");
          console.warn(`Attempt ${attempt + 1}/${maxRetries} failed: No item returned`);
          continue; // Try again
        }

        // Success! Return the project item ID
        console.log("Successfully added issue to project:", data.addProjectV2ItemById.item.id);
        return data.addProjectV2ItemById.item.id;
      } catch (err) {
        lastError = err;
        console.warn(`Attempt ${attempt + 1}/${maxRetries} failed with exception:`, err);
        // Continue to next retry
      }
    }

    // All retries failed
    console.error("Failed to add issue to project after all retries:", lastError);
    throw lastError;
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

  /**
   * Get repositories for a project - uses appInitializationService
   */
  async getProjectRepositories(projectId: string): Promise<Array<{ id: string; name: string }>> {
    const project = appInitializationService.getProjectById(projectId);
    if (project && project.repositories) {
      return project.repositories.map((repo) => ({
        id: repo.id,
        name: repo.name,
      }));
    }
    return [];
  }

  /**
   * Update an existing issue
   */
  async updateIssue(id: string, title: string, body?: string): Promise<BoardIssue | null> {
    try {
      // First check if this is a project item ID (PVTI_*) or an issue ID (I_*)
      // We need the actual Issue ID for the updateIssue mutation
      let issueId = id;

      // If this is a project item ID, we need to find the corresponding issue
      if (id.startsWith("PVTI_")) {
        // Try to find the issue from our cached data - this assumes issueId field holds the actual Issue ID
        const issue = await this.findIssueByProjectItemId(id);
        if (issue && issue.issueId) {
          issueId = issue.issueId;
        } else {
          console.error("Could not find Issue ID for ProjectV2Item:", id);
          return null;
        }
      }

      const { data, error } = await this.client
        .mutation(UpdateIssueDocument, {
          id: issueId,
          title,
          body,
        })
        .toPromise();

      if (error || !data?.updateIssue?.issue) {
        console.error("Error updating issue:", error);
        return null;
      }

      // Return a BoardIssue with the updated data
      return {
        id: id, // Keep the original ID passed to this method
        issueId: data.updateIssue.issue.id,
        title: data.updateIssue.issue.title,
        body: data.updateIssue.issue.body || "",
        // Other fields remain undefined but that's OK for an update operation
      };
    } catch (err) {
      console.error("Exception updating issue:", err);
      return null;
    }
  }

  /**
   * Helper method to find an issue by its ProjectV2Item ID
   */
  private async findIssueByProjectItemId(projectItemId: string): Promise<BoardIssue | null> {
    try {
      // This is a simplistic implementation that assumes we need to query for the specific item
      // A more efficient implementation would maintain a cache of ProjectV2Item -> Issue mappings

      // Extract project ID from the current URL
      const projectId = this.extractProjectIdFromUrl();
      if (!projectId) {
        console.error("Could not extract project ID from URL");
        return null;
      }

      // Query for the specific project item
      const { data, error } = await this.client
        .query(GetProjectIssuesDocument, { projectId })
        .toPromise();

      if (error || !data?.node) {
        console.error("Error fetching project items:", error);
        return null;
      }

      // Process the nodes using our existing logic but filter for the specific project item
      const nodes = data.node.items?.nodes || [];
      const targetNode = nodes.find((node: ProjectNodeData) => node?.id === projectItemId);

      if (!targetNode) {
        console.error("Could not find project item with ID:", projectItemId);
        return null;
      }

      // Create a BoardIssue from the node
      return {
        id: targetNode.id,
        issueId: targetNode.content?.id,
        title: targetNode.content?.title || "",
        body: targetNode.content?.body || "",
        number: targetNode.content?.number || 0,
      };
    } catch (err) {
      console.error("Error finding issue by project item ID:", err);
      return null;
    }
  }

  /**
   * Helper to extract the project ID from the current URL
   */
  private extractProjectIdFromUrl(): string | null {
    if (typeof window === "undefined") return null;

    // Extract project ID from URL - assumes URL pattern like /projects/{projectId}
    const match = window.location.pathname.match(/\/projects\/([^/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Delete an issue
   */
  async deleteIssue(id: string): Promise<boolean> {
    try {
      // First check if this is a project item ID (PVTI_*) or an issue ID (I_*)
      // We need the actual Issue ID for the deleteIssue mutation
      let issueId = id;

      // If this is a project item ID, we need to find the corresponding issue
      if (id.startsWith("PVTI_")) {
        // Try to find the issue from our cached data
        const issue = await this.findIssueByProjectItemId(id);
        if (issue && issue.issueId) {
          issueId = issue.issueId;
        } else {
          console.error("Could not find Issue ID for ProjectV2Item:", id);
          return false;
        }
      }

      const { data, error } = await this.client
        .mutation(DeleteIssueDocument, {
          issueId,
        })
        .toPromise();

      if (error) {
        console.error("Error deleting issue:", error);
        return false;
      }

      return data?.deleteIssue?.clientMutationId !== null;
    } catch (err) {
      console.error("Exception deleting issue:", err);
      return false;
    }
  }
}

export const issueService = new IssueService();

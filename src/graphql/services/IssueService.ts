/**
 * Issue Service
 *
 * Service class to handle all issue-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { gql } from "urql";

import { Issue } from "../../types";
import { client } from "../client";
import { getFragmentData } from "../generated/fragment-masking";
import {
  GetProjectIssuesDocument,
  CreateDraftIssueDocument,
  UpdateIssueStatusDocument,
  IssueFieldsFragmentDoc,
} from "../generated/graphql";

/**
 * Service for managing project issues
 */
export class IssueService {
  private client = client;

  /**
   * Get issues for a project
   */
  async getIssues(projectId: string, count: number = 100): Promise<Issue[]> {
    const { data, error } = await this.client
      .query(GetProjectIssuesDocument, { projectId, first: count })
      .toPromise();

    if (error || !data?.node) {
      console.error("Error fetching project issues:", error);
      return [];
    }

    if (data.node.__typename !== "ProjectV2" || !data.node.items?.nodes) {
      return [];
    }

    return data.node.items.nodes
      .filter((item) => item !== null && item.content)
      .map((item) => {
        // Determine the status ID from field values
        let statusId: string | undefined;
        const statusField = item.fieldValues?.nodes?.find(
          (fieldValue) =>
            fieldValue &&
            fieldValue.__typename === "ProjectV2ItemFieldSingleSelectValue" &&
            fieldValue.field &&
            fieldValue.field.name === "Status"
        );

        if (statusField && statusField.__typename === "ProjectV2ItemFieldSingleSelectValue") {
          statusId = statusField.name;
        }

        // Handle draft issues
        if (item.content.__typename === "DraftIssue") {
          return {
            id: item.content.id,
            title: item.content.title,
            body: item.content.body || "",
            statusId,
            isDraft: true,
            projectItemId: item.id,
          };
        }

        // Handle regular issues
        if (item.content.__typename === "Issue") {
          const issueData = getFragmentData(IssueFieldsFragmentDoc, item.content);
          return {
            id: issueData.id,
            title: issueData.title,
            body: issueData.body || "",
            number: issueData.number,
            statusId,
            labels:
              issueData.labels?.nodes.map((label) => ({
                id: label.id,
                name: label.name,
                color: label.color,
                description: label.description || "",
              })) || [],
            isDraft: false,
            projectItemId: item.id,
          };
        }

        // Fallback
        return {
          id: item.id,
          title: "Unknown Item",
          projectItemId: item.id,
        } as Issue;
      });
  }

  /**
   * Create a draft issue
   */
  async createDraftIssue(projectId: string, title: string, body?: string): Promise<Issue | null> {
    const { data, error } = await this.client
      .mutation(CreateDraftIssueDocument, { projectId, title, body: body || "" })
      .toPromise();

    if (error || !data?.addProjectV2DraftIssue?.projectItem) {
      console.error("Error creating draft issue:", error);
      return null;
    }

    const projectItem = data.addProjectV2DraftIssue.projectItem;
    const draftIssue = projectItem.content;

    if (draftIssue && draftIssue.__typename === "DraftIssue") {
      return {
        id: draftIssue.id,
        title: draftIssue.title,
        body: draftIssue.body || "",
        isDraft: true,
        projectItemId: projectItem.id,
      };
    }

    return null;
  }

  /**
   * Update an issue's status
   */
  async updateIssueStatus(
    projectId: string,
    itemId: string,
    fieldId: string,
    statusOptionId: string
  ): Promise<boolean> {
    const { error } = await this.client
      .mutation(UpdateIssueStatusDocument, { projectId, itemId, fieldId, optionId: statusOptionId })
      .toPromise();

    if (error) {
      console.error("Error updating issue status:", error);
      return false;
    }

    return true;
  }

  /**
   * Helper to get the Status field ID
   */
  public async getStatusFieldId(projectId: string): Promise<string | null> {
    const FIELDS_QUERY = gql`
      query GetProjectFields($projectId: ID!) {
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

    const { data, error } = await this.client.query(FIELDS_QUERY, { projectId }).toPromise();

    if (error || !data?.node) {
      console.error("Error fetching project fields:", error);
      return null;
    }

    if (data.node.__typename === "ProjectV2" && data.node.fields?.nodes) {
      const statusField = data.node.fields.nodes.find(
        (field) =>
          field && field.__typename === "ProjectV2SingleSelectField" && field.name === "Status"
      );

      if (statusField) {
        return statusField.id;
      }
    }

    return null;
  }
}

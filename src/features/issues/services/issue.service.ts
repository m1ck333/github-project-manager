import { githubClient } from "../../../api-github/client";
import { CreateIssueDocument, DeleteIssueDocument, UpdateIssueStatusDocument } from "../api";

/**
 * Service responsible for issue operations
 */
export class IssueService {
  /**
   * Create an issue
   */
  async createIssue(
    repositoryId: string,
    title: string,
    body: string = ""
  ): Promise<{ issueId: string; number: number }> {
    const result = await githubClient
      .mutation(CreateIssueDocument, {
        repositoryId,
        title,
        body,
      })
      .toPromise();

    if (!result.data?.createIssue?.issue) {
      throw new Error("Failed to create issue");
    }

    return {
      issueId: result.data.createIssue.issue.id,
      number: result.data.createIssue.issue.number,
    };
  }

  /**
   * Update an issue's status
   */
  async updateIssueStatus(
    projectId: string,
    itemId: string,
    statusFieldId: string,
    statusOptionId: string
  ): Promise<boolean> {
    const result = await githubClient
      .mutation(UpdateIssueStatusDocument, {
        projectId,
        itemId,
        fieldId: statusFieldId,
        valueId: statusOptionId,
      })
      .toPromise();

    return Boolean(result.data?.updateProjectV2ItemFieldValue?.projectV2Item);
  }

  /**
   * Delete an issue
   */
  async deleteIssue(issueId: string): Promise<boolean> {
    const result = await githubClient.mutation(DeleteIssueDocument, { issueId }).toPromise();

    return Boolean(result.data?.deleteIssue);
  }
}

// Create a singleton instance
export const issueService = new IssueService();

import { graphQLClientService } from "../../../services/graphql-client.service";
import {
  CreateIssueDocument,
  UpdateIssueStatusDocument,
  DeleteIssueDocument,
  AddProjectItemDocument,
  CreateLabelDocument,
} from "../api";
import { Label } from "../types";

/**
 * Service responsible for project issue operations
 */
export class ProjectIssueService {
  /**
   * Create an issue
   */
  async createIssue(
    repositoryId: string,
    title: string,
    body: string = ""
  ): Promise<{ issueId: string; number: number }> {
    const data = await graphQLClientService.mutation(CreateIssueDocument, {
      repositoryId,
      title,
      body,
    });

    if (!data?.createIssue?.issue) {
      throw new Error("Failed to create issue");
    }

    return {
      issueId: data.createIssue.issue.id,
      number: data.createIssue.issue.number,
    };
  }

  /**
   * Add an issue to a project
   */
  async addIssueToProject(projectId: string, issueId: string): Promise<string> {
    const input = {
      projectId,
      contentId: issueId,
    };

    const data = await graphQLClientService.mutation(AddProjectItemDocument, { input });

    if (!data?.addProjectV2ItemById?.item) {
      throw new Error("Failed to add issue to project");
    }

    return data.addProjectV2ItemById.item.id;
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
    const data = await graphQLClientService.mutation(UpdateIssueStatusDocument, {
      projectId,
      itemId,
      fieldId: statusFieldId,
      valueId: statusOptionId,
    });

    return Boolean(data?.updateProjectV2ItemFieldValue?.projectV2Item);
  }

  /**
   * Delete an issue
   */
  async deleteIssue(issueId: string): Promise<boolean> {
    const data = await graphQLClientService.mutation(DeleteIssueDocument, { issueId });

    return Boolean(data?.deleteIssue);
  }

  /**
   * Create a label for a repository
   */
  async createLabel(
    repositoryId: string,
    name: string,
    color: string,
    description?: string
  ): Promise<Label> {
    // GitHub expects hex colors without the # prefix
    const colorHex = color.startsWith("#") ? color.substring(1) : color;

    const input = {
      repositoryId,
      name,
      color: colorHex,
      description: description || "",
    };

    const data = await graphQLClientService.mutation(CreateLabelDocument, { input });

    if (!data?.createLabel?.label) {
      throw new Error("Failed to create label");
    }

    const labelData = data.createLabel.label;
    return {
      id: labelData.id,
      name: labelData.name,
      color: `#${labelData.color}`,
      description: labelData.description || "",
    };
  }
}

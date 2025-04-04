import { executeGitHubMutation } from "@/api-github";
import { ProjectV2SingleSelectFieldOptionColor } from "@/api-github/generated/graphql";

import { LinkRepositoryToProjectDocument, AddColumnDocument } from "../api";

/**
 * Service responsible for project relationships
 */
export class ProjectRelationsService {
  /**
   * Link a repository to a project
   */
  async linkRepositoryToProject(projectId: string, repositoryId: string): Promise<boolean> {
    const input = {
      projectId,
      repositoryId,
    };

    const { data, error } = await executeGitHubMutation(LinkRepositoryToProjectDocument, { input });

    if (error) {
      throw error;
    }

    return Boolean(data?.linkProjectV2ToRepository);
  }

  /**
   * Add a column to a project
   */
  async addColumn(projectId: string, columnName: string): Promise<string> {
    const { error } = await executeGitHubMutation(AddColumnDocument, {
      projectId,
      name: columnName,
      color: ProjectV2SingleSelectFieldOptionColor.Blue,
    });

    if (error) {
      throw error;
    }

    return "success";
  }
}

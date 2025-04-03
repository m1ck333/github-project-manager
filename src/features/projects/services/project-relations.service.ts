import { ProjectV2SingleSelectFieldOptionColor } from "../../../api/generated/graphql";
import { graphQLClientService } from "../../../services/graphql-client.service";
import { LinkRepositoryToProjectDocument, AddColumnDocument } from "../api";
import { Column, ColumnFormData, ColumnType } from "../types";

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

    const data = await graphQLClientService.mutation(LinkRepositoryToProjectDocument, { input });

    return Boolean(data?.linkProjectV2ToRepository);
  }

  /**
   * Add a column to a project
   */
  async addColumn(columnData: ColumnFormData, statusFieldId: string): Promise<Column | null> {
    // Convert column type to a color
    const color = this.getColorForColumnType(columnData.type);

    await graphQLClientService.mutation(AddColumnDocument, {
      projectId: statusFieldId,
      name: columnData.name,
      color:
        ProjectV2SingleSelectFieldOptionColor[
          color as keyof typeof ProjectV2SingleSelectFieldOptionColor
        ],
    });

    // Since our mutation doesn't return the field ID, we create a simulated column
    // In a real app, we would fetch the project fields to get the actual field ID
    const newColumn: Column = {
      id: `temp-${Date.now()}`,
      name: columnData.name,
      type: columnData.type,
      fieldId: statusFieldId,
    };

    return newColumn;
  }

  /**
   * Helper method to get a color for a column type
   */
  private getColorForColumnType(type: ColumnType): string {
    switch (type) {
      case ColumnType.TODO:
        return "Blue";
      case ColumnType.IN_PROGRESS:
        return "Yellow";
      case ColumnType.DONE:
        return "Green";
      case ColumnType.BACKLOG:
        return "Purple";
      default:
        return "Gray";
    }
  }
}

import { AbstractBaseService } from "@/common/services";
import { executeServiceOperation } from "@/common/utils/service.utils";
import { collaboratorService } from "@/features/collaborators/services";
import { CollaboratorRole, CollaboratorFormData } from "@/features/collaborators/types";
import { columnService } from "@/features/columns/services";
import { ColumnType } from "@/features/columns/types/column.types";
import { issueService } from "@/features/issues/services";
import { labelService } from "@/features/labels/services";
import { repositoryCrudService } from "@/features/repositories/services";

import { Project } from "../types";

/**
 * Service for managing project-related operations
 */
export class ProjectRelatedService extends AbstractBaseService {
  private getProjectById: (id: string) => Project | undefined;

  constructor(getProjectById: (id: string) => Project | undefined) {
    super();
    this.getProjectById = getProjectById;
  }

  /**
   * Validates that a project exists before performing operations
   */
  private validateProjectExists(projectId: string): void {
    const existingProject = this.getProjectById(projectId);
    if (!existingProject) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
  }

  /**
   * Add a column to a project
   */
  async addColumnToProject(projectId: string, name: string, _columnType: ColumnType) {
    return executeServiceOperation(
      this,
      async () => {
        this.validateProjectExists(projectId);
        await columnService.addColumn(projectId, name);
        return { columnName: name };
      },
      {
        errorPrefix: "Failed to add column",
        successMessage: `Column ${name} added to project`,
      }
    );
  }

  /**
   * Add an issue to a project
   */
  async addIssueToProject(projectId: string, title: string, description: string = "") {
    return executeServiceOperation(
      this,
      async () => {
        this.validateProjectExists(projectId);
        const result = await issueService.createIssue(projectId, title, description);
        return { issueId: result.issueId, issueNumber: result.number };
      },
      {
        errorPrefix: "Failed to add issue",
        successMessage: `Issue '${title}' added to project`,
      }
    );
  }

  /**
   * Add a label to a project
   */
  async addLabelToProject(projectId: string, name: string, color: string) {
    return executeServiceOperation(
      this,
      async () => {
        this.validateProjectExists(projectId);
        const label = await labelService.createLabel(projectId, name, color);
        return { labelId: label.id, labelName: label.name };
      },
      {
        errorPrefix: "Failed to add label",
        successMessage: `Label '${name}' added to project`,
      }
    );
  }

  /**
   * Add a collaborator to a project
   */
  async addCollaboratorToProject(
    projectId: string,
    username: string,
    permission: CollaboratorRole
  ) {
    return executeServiceOperation(
      this,
      async () => {
        this.validateProjectExists(projectId);
        const collaboratorData: CollaboratorFormData = {
          username,
          role: permission,
        };
        await collaboratorService.addRepositoryCollaborator(projectId, collaboratorData);
        return { username, permission };
      },
      {
        errorPrefix: "Failed to add collaborator",
        successMessage: `Collaborator '${username}' added to project with ${permission} permissions`,
      }
    );
  }

  /**
   * Add a repository to a project
   */
  async addRepositoryToProject(
    projectId: string,
    name: string,
    visibility: "PRIVATE" | "PUBLIC" | "INTERNAL"
  ) {
    return executeServiceOperation(
      this,
      async () => {
        this.validateProjectExists(projectId);
        const repo = await repositoryCrudService.createRepository(name, "", visibility);
        return { repositoryId: repo.id, repositoryName: repo.name };
      },
      {
        errorPrefix: "Failed to add repository",
        successMessage: `Repository '${name}' created and associated with project ${projectId}`,
      }
    );
  }
}

// The singleton instance will be created in the index.ts file

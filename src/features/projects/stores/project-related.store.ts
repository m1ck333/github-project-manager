import { action, makeObservable } from "mobx";

import { AbstractEntityStore } from "@/common/stores";
import type { CollaboratorRole } from "@/features/collaborators/types";
import type { ColumnType } from "@/features/columns/types/column.types";

import { projectRelatedService } from "../services";

import { ProjectStateManager } from "./project-state";

/**
 * Handles related operations for projects
 */
export class ProjectRelatedStore extends AbstractEntityStore {
  constructor(private stateManager: ProjectStateManager) {
    super();
    makeObservable(this);
  }

  /**
   * Add column to project
   */
  @action
  async addColumnToProject(
    projectId: string,
    name: string,
    columnType: ColumnType
  ): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    const result = await projectRelatedService.addColumnToProject(projectId, name, columnType);

    if (result.error) {
      this.setError(result.error);
    } else if (result.success) {
      this.checkProjectRefresh(projectId);
    }

    this.setLoading(false);
    return result.success;
  }

  /**
   * Add issue to project
   */
  @action
  async addIssueToProject(
    projectId: string,
    title: string,
    description: string = ""
  ): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    const result = await projectRelatedService.addIssueToProject(projectId, title, description);

    if (result.error) {
      this.setError(result.error);
    } else if (result.success) {
      this.checkProjectRefresh(projectId);
    }

    this.setLoading(false);
    return result.success;
  }

  /**
   * Add label to project
   */
  @action
  async addLabelToProject(projectId: string, name: string, color: string): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    const result = await projectRelatedService.addLabelToProject(projectId, name, color);

    if (result.error) {
      this.setError(result.error);
    } else if (result.success) {
      this.checkProjectRefresh(projectId);
    }

    this.setLoading(false);
    return result.success;
  }

  /**
   * Add collaborator to project
   */
  @action
  async addCollaboratorToProject(
    projectId: string,
    username: string,
    permission: CollaboratorRole
  ): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    const result = await projectRelatedService.addCollaboratorToProject(
      projectId,
      username,
      permission
    );

    if (result.error) {
      this.setError(result.error);
    } else if (result.success) {
      this.checkProjectRefresh(projectId);
    }

    this.setLoading(false);
    return result.success;
  }

  /**
   * Add repository to project
   */
  @action
  async addRepositoryToProject(
    projectId: string,
    name: string,
    visibility: "PRIVATE" | "PUBLIC" | "INTERNAL"
  ): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    const result = await projectRelatedService.addRepositoryToProject(projectId, name, visibility);

    if (result.error) {
      this.setError(result.error);
    } else if (result.success) {
      this.checkProjectRefresh(projectId);
    }

    this.setLoading(false);
    return result.success;
  }

  /**
   * Link a repository to a project
   * @param projectId The ID of the project to link to
   * @param owner The repository owner's login
   * @param name The repository name
   * @returns Promise resolving to true if successful
   */
  @action
  async linkRepositoryToProject(projectId: string, owner: string, name: string): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    try {
      // Currently just simulating a success response
      // This would typically call a service method
      console.log(`Linking repository ${owner}/${name} to project ${projectId}`);

      // In the future, this would be a real service call:
      // const result = await projectRelatedService.linkRepositoryToProject(projectId, owner, name);

      this.checkProjectRefresh(projectId);
      this.setLoading(false);
      return true;
    } catch (error) {
      console.error("Error linking repository to project:", error);
      this.setError(error instanceof Error ? error : new Error(String(error)));
      this.setLoading(false);
      return false;
    }
  }

  /**
   * Reset store
   */
  reset(): void {
    super.reset();
  }

  /**
   * Helper to check if project state needs refresh
   */
  private checkProjectRefresh(projectId: string): void {
    if (this.stateManager.selectedProject?.id === projectId) {
      this.stateManager.selectProject(projectId);
    }
  }
}

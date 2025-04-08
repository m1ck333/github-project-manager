import { makeObservable, observable, action } from "mobx";

import { executeGitHubMutation } from "@/api-github";
import {
  AddColumnDocument,
  UpdateIssueStatusDocument,
  ProjectV2SingleSelectFieldOptionColor,
} from "@/api-github/generated/graphql";

import { Column } from "../types/column.types";

/**
 * Service for managing columns in project boards
 */
export class ColumnService {
  @observable private _isLoading = false;
  @observable private _error: Error | null = null;

  constructor() {
    makeObservable(this);
  }

  // Getters
  get isLoading(): boolean {
    return this._isLoading;
  }

  get error(): Error | null {
    return this._error;
  }

  /**
   * Add a new column to a project
   */
  @action
  async addColumn(projectId: string, columnName: string): Promise<string> {
    this.setLoading(true);
    this.setError(null);

    try {
      const { error } = await executeGitHubMutation(AddColumnDocument, {
        projectId,
        name: columnName,
        color: ProjectV2SingleSelectFieldOptionColor.Blue,
      });

      if (error) {
        throw error;
      }

      return "success";
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.setError(errorObj);
      throw errorObj;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Move an item between columns
   */
  @action
  async moveItemBetweenColumns(
    projectId: string,
    itemId: string,
    fieldId: string,
    targetColumnId: string
  ): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    try {
      const { data, error } = await executeGitHubMutation(UpdateIssueStatusDocument, {
        projectId,
        itemId,
        fieldId,
        valueId: targetColumnId,
      });

      if (error) {
        throw error;
      }

      return Boolean(data?.updateProjectV2ItemFieldValue?.projectV2Item?.id);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.setError(errorObj);
      throw errorObj;
    } finally {
      this.setLoading(false);
    }
  }

  // Helper methods
  @action
  private setLoading(isLoading: boolean): void {
    this._isLoading = isLoading;
  }

  @action
  private setError(error: Error | null): void {
    this._error = error;
  }
}

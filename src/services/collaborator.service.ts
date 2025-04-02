import { makeAutoObservable } from "mobx";

import { client } from "../api/client";
import {
  ProjectV2Roles,
  AddCollaboratorDocument,
  RemoveCollaboratorDocument,
  ProjectV2Collaborator,
} from "../api/generated/graphql";
import { CollaboratorFormData, CollaboratorRole, Project } from "../core/types";

import { appInitializationService } from "./app-init.service";

// Define ProjectStateStore interface
interface ProjectStateStore {
  selectedProject: Project | null;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  setError: (error: unknown) => void;
}

// This will need to be properly imported or injected
// Temporary placeholder until we integrate with the actual project state
const projectStateStore: ProjectStateStore = {
  selectedProject: null,
  setLoading: () => {},
  clearError: () => {},
  setError: () => {},
};

export class CollaboratorService {
  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Add a collaborator to a project using GitHub's GraphQL API
   * @param projectId The ID of the project
   * @param data The collaborator data to add
   */
  async addCollaborator(projectId: string, data: CollaboratorFormData) {
    return this.withErrorHandling(async () => {
      // Convert form data role to GraphQL role
      const role = this.mapRoleToGraphQL(data.role);

      // GitHub's API for collaborators works by setting the entire set of collaborators at once
      // We need to get the current collaborators and add our new one
      const project = projectStateStore.selectedProject;
      if (!project) {
        throw new Error("Project not found");
      }

      // Prepare the collaborator data
      const collaborators: ProjectV2Collaborator[] = [
        {
          // In a real app, we'd need to look up the userID by username
          // For demo purposes, we're assuming the username is the GitHub user ID
          userId: data.username,
          role,
        },
      ];

      // We'll make a GraphQL mutation to update the collaborators
      await client
        .mutation(AddCollaboratorDocument, {
          projectId,
          collaborators,
        })
        .toPromise();

      // Refresh data to ensure our state is in sync
      await appInitializationService.initialize();

      return true;
    });
  }

  /**
   * Remove a collaborator from a project
   * @param projectId The ID of the project
   * @param collaboratorId The ID of the collaborator to remove
   */
  async removeCollaborator(projectId: string, collaboratorId: string) {
    return this.withErrorHandling(async () => {
      // Due to GitHub API limitations, this would normally require getting all collaborators,
      // removing the one we want to delete, and then setting the entire list again.
      // For the demo, we'll simulate this by calling the API service

      console.log(`Removing collaborator ${collaboratorId} from project ${projectId}`);

      // Placeholder collaborators list - in a real app, we would filter out the removed collaborator
      const collaborators: ProjectV2Collaborator[] = [
        {
          // In a real app, we would filter out the collaborator we want to remove
          // For demo, we're just passing a dummy entry to simulate the API call
          userId: "dummy-placeholder",
          role: ProjectV2Roles.Admin,
        },
      ];

      await client
        .mutation(RemoveCollaboratorDocument, {
          projectId,
          collaborators,
        })
        .toPromise();

      // Refresh data to ensure our state is in sync
      await appInitializationService.initialize();

      return true;
    });
  }

  /**
   * Execute an operation with standardized loading and error handling
   * @param operation - The async operation to execute
   * @returns The result of the operation
   */
  private async withErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
    projectStateStore.setLoading(true);
    projectStateStore.clearError();

    try {
      return await operation();
    } catch (error) {
      projectStateStore.setError(error);
      throw error;
    } finally {
      projectStateStore.setLoading(false);
    }
  }

  /**
   * Map the application's role enum to the GraphQL API role enum
   * @private
   */
  private mapRoleToGraphQL(role: CollaboratorRole): ProjectV2Roles {
    switch (role) {
      case CollaboratorRole.READ:
        return ProjectV2Roles.Reader;
      case CollaboratorRole.WRITE:
        return ProjectV2Roles.Writer;
      case CollaboratorRole.ADMIN:
        return ProjectV2Roles.Admin;
      default:
        return ProjectV2Roles.Reader;
    }
  }
}

export const collaboratorService = new CollaboratorService();

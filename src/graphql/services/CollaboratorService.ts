/**
 * Collaborator Service
 *
 * Service class to handle all collaborator-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { gql } from "urql";

import { CollaboratorFormData, CollaboratorRole } from "../../types";
import { client } from "../client";
import { ProjectV2Roles, UpdateProjectCollaboratorsDocument } from "../operations/operation-names";

// Define the GetUser query directly since it's not in the operations folder
const GetUserDocument = gql`
  query GetUser($login: String!) {
    user(login: $login) {
      id
      login
      name
      avatarUrl
      url
      bio
    }
  }
`;

/**
 * Service for managing project collaborators
 */
export class CollaboratorService {
  private client = client;

  /**
   * Add a collaborator to a project
   */
  async addProjectCollaborator(
    projectId: string,
    collaboratorData: CollaboratorFormData
  ): Promise<boolean> {
    // Convert our internal role type to GitHub's ProjectV2Roles
    const roleMapping: Record<CollaboratorRole, ProjectV2Roles> = {
      [CollaboratorRole.READ]: ProjectV2Roles.Reader,
      [CollaboratorRole.WRITE]: ProjectV2Roles.Writer,
      [CollaboratorRole.ADMIN]: ProjectV2Roles.Admin,
    };

    try {
      // First, get the user's global node ID by looking them up by username
      const { data: userData, error: userError } = await this.client
        .query(GetUserDocument, {
          login: collaboratorData.username,
        })
        .toPromise();

      if (userError || !userData?.user?.id) {
        console.error("Could not find user with username:", collaboratorData.username, userError);
        return false;
      }

      // Use the actual global node ID from the user lookup
      const userId = userData.user.id;

      // Use the updateProjectV2Collaborators mutation with the global node ID
      const { data, error } = await this.client
        .mutation(UpdateProjectCollaboratorsDocument, {
          projectId,
          collaborators: [
            {
              userId: userId, // Use the global node ID, not the username
              role: roleMapping[collaboratorData.role],
            },
          ],
        })
        .toPromise();

      if (error) {
        console.error("Error adding collaborator:", error);
        return false;
      }

      // Check if data.updateProjectV2Collaborators exists, regardless of clientMutationId
      return (
        data?.updateProjectV2Collaborators !== null &&
        data?.updateProjectV2Collaborators !== undefined
      );
    } catch (error) {
      console.error("Error adding collaborator:", error);
      return false;
    }
  }

  /**
   * Remove a collaborator from a project
   * Note: GitHub GraphQL API doesn't have a direct "remove collaborator" mutation
   * Removing a collaborator is typically done by setting their role to NONE
   */
  async removeProjectCollaborator(projectId: string, collaboratorId: string): Promise<boolean> {
    try {
      // In this case, we need to determine if the collaboratorId is already a global node ID
      // or if it's a username/custom ID from our local state

      // For simplicity in this implementation, we'll assume collaboratorId is a username
      // In a real app, you might store the global IDs or need more sophisticated lookup

      // Get the user's global node ID
      const { data: userData, error: userError } = await this.client
        .query(GetUserDocument, {
          login: collaboratorId,
        })
        .toPromise();

      if (userError || !userData?.user?.id) {
        console.error("Could not find user with ID/username:", collaboratorId, userError);
        return false;
      }

      // Use the global node ID we just looked up
      const userId = userData.user.id;

      // Use the updateProjectV2Collaborators mutation with role: NONE
      const { data, error } = await this.client
        .mutation(UpdateProjectCollaboratorsDocument, {
          projectId,
          collaborators: [
            {
              userId: userId,
              role: ProjectV2Roles.None, // Setting role to NONE effectively removes the collaborator
            },
          ],
        })
        .toPromise();

      if (error) {
        console.error("Error removing collaborator:", error);
        return false;
      }

      // Check if data.updateProjectV2Collaborators exists, regardless of clientMutationId
      return (
        data?.updateProjectV2Collaborators !== null &&
        data?.updateProjectV2Collaborators !== undefined
      );
    } catch (error) {
      console.error("Error removing collaborator:", error);
      return false;
    }
  }
}

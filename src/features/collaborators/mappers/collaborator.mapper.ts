import { User } from "@/api-github/schema/github-schema";

import { Collaborator, CollaboratorPermission } from "../types/collaborator.types";

/**
 * Maps GitHub user data to our internal Collaborator model
 */
export function mapToCollaborator(
  userData: User,
  permission: CollaboratorPermission
): Collaborator {
  return {
    id: userData.id,
    login: userData.login,
    avatarUrl: userData.avatarUrl,
    permission,
  };
}

/**
 * Maps an array of GitHub user data to our internal Collaborator model
 */
export function mapToCollaborators(
  usersData?: User[],
  permission: CollaboratorPermission = "READ"
): Collaborator[] {
  if (!usersData?.length) return [];

  return usersData.map((user) => mapToCollaborator(user, permission));
}

/**
 * GraphQL Utility Functions
 *
 * This file contains helper functions for working with GraphQL data
 * and transforming between API and application data structures.
 */

import { ProjectFieldsFragment } from "../graphql/generated/graphql";
import { Project } from "../types";
// Since ProjectV2 is a GraphQL type from the GitHub schema, we need to import it from the generated schema

/**
 * Transform a GitHub ProjectV2 object to our local Project type
 */
export function transformProjectV2ToProject(projectV2: ProjectFieldsFragment): Project {
  // Extract owner details safely with type checking
  let ownerLogin = "unknown";
  let ownerAvatarUrl = "";

  // Check if owner exists and has expected properties
  if (projectV2.owner) {
    // We need to check both User and Organization types which both have login and avatarUrl
    if ("login" in projectV2.owner && typeof projectV2.owner.login === "string") {
      ownerLogin = projectV2.owner.login;
    }

    if ("avatarUrl" in projectV2.owner && typeof projectV2.owner.avatarUrl === "string") {
      ownerAvatarUrl = projectV2.owner.avatarUrl;
    }
  }

  return {
    id: projectV2.id,
    name: projectV2.title,
    description: projectV2.shortDescription || "",
    createdAt: projectV2.createdAt,
    updatedAt: projectV2.updatedAt,
    createdBy: {
      login: ownerLogin,
      avatarUrl: ownerAvatarUrl,
    },
    url: projectV2.url,
    html_url: projectV2.url,
    owner: {
      login: ownerLogin,
      avatar_url: ownerAvatarUrl,
    },
  };
}

/**
 * Helper method to extract node ID from a project
 */
export function getProjectNodeId(projectId: string | number): string {
  // If it's already a full node ID, return as is
  if (typeof projectId === "string") {
    return projectId;
  }
  throw new Error("Invalid project ID format");
}

/**
 * Map column name to column type based on common patterns
 */
export function mapNameToColumnType(name: string): string {
  const normalizedName = name.toUpperCase();

  if (normalizedName.includes("TODO") || normalizedName.includes("TO DO")) {
    return "TODO";
  }
  if (normalizedName.includes("PROGRESS") || normalizedName.includes("DOING")) {
    return "IN_PROGRESS";
  }
  if (normalizedName.includes("DONE") || normalizedName.includes("COMPLETED")) {
    return "DONE";
  }
  if (normalizedName.includes("BACKLOG")) {
    return "BACKLOG";
  }

  // Default to TODO
  return "TODO";
}

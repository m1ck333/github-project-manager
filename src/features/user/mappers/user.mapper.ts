import { User as GitHubUser, ProjectV2Owner, Actor } from "@/api-github/generated/graphql";

import type { User } from "../types/user.types";

/**
 * Maps GitHub API user data to our internal User model
 */
export const mapToUser = (user: GitHubUser): User => {
  return {
    id: user.id || "",
    login: user.login,
    avatarUrl: user.avatarUrl,
    name: user.name ?? null,
    bio: user.bio ?? null,
    location: user.location ?? null,
    company: user.company ?? null,
    email: user.email ?? null,
    websiteUrl: user.url ?? null, // Using url as fallback for websiteUrl
    twitterUsername: user.twitterUsername ?? null,
  };
};

/**
 * Maps ProjectV2Owner to our internal User model
 */
export const mapOwnerToUser = (owner: ProjectV2Owner): User => {
  return {
    id: owner.id || "",
    login: "", // ProjectV2Owner doesn't have a login
    avatarUrl: "", // ProjectV2Owner doesn't have an avatarUrl
    name: null,
    bio: null,
    location: null,
    company: null,
    email: null,
    websiteUrl: null,
    twitterUsername: null,
  };
};

/**
 * Helper to check if an object is an Actor
 */
export const isActor = (obj: unknown): obj is Actor => {
  return obj !== null && typeof obj === "object" && "login" in obj && "avatarUrl" in obj;
};

/**
 * Maps Actor type to our internal User model
 */
export const mapActorToUser = (actor: Actor): User => {
  return {
    id: "", // Actor might not have id
    login: actor.login,
    avatarUrl: actor.avatarUrl,
    name: null,
    bio: null,
    location: null,
    company: null,
    email: null,
    websiteUrl: null,
    twitterUsername: null,
  };
};

/**
 * Flexible mapper that handles different user-like types
 */
export const mapAnyUserType = (userLike: Actor | ProjectV2Owner | GitHubUser): User => {
  if (isActor(userLike)) {
    return mapActorToUser(userLike);
  } else {
    // It's a ProjectV2Owner
    return mapOwnerToUser(userLike as ProjectV2Owner);
  }
};

// Export with old name for backward compatibility
export const mapToUserProfile = mapToUser;

import { UserApiModel } from "../types/user-api.types";
import { UserProfile } from "../types/user.types";

/**
 * Maps a GitHub API user model to our internal UserProfile model
 */
export const mapToUserProfile = (user: UserApiModel): UserProfile => {
  return {
    login: user.login,
    name: user.name ?? null,
    avatarUrl: user.avatarUrl,
    bio: user.bio ?? null,
    location: user.location ?? null,
    company: user.company ?? null,
    email: user.email ?? null,
    websiteUrl: user.websiteUrl ?? null,
    twitterUsername: user.twitterUsername ?? null,
  };
};

import { GetViewerDocument } from "../api/operations/operation-names";
import { UserProfile } from "../types";

import { graphQLClientService } from "./graphql-client.service";

/**
 * Service responsible for user-related operations
 */
export class UserService {
  private userId: string | null = null;
  private userProfile: UserProfile | null = null;

  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Get the current user profile
   */
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  /**
   * Verify the user's authentication token
   */
  async verifyToken(): Promise<boolean> {
    try {
      const data = await graphQLClientService.query(GetViewerDocument, {});

      // If we get a successful response, the token is valid
      if (data.viewer && data.viewer.id) {
        this.userId = data.viewer.id;
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch basic user profile information
   */
  async fetchBasicProfile(): Promise<UserProfile> {
    const data = await graphQLClientService.query(GetViewerDocument, {});

    if (!data.viewer) {
      throw new Error("Failed to fetch user data");
    }

    // Create a minimal user profile based on the viewer data
    const profile: UserProfile = {
      login: data.viewer.login,
      name: null,
      avatarUrl: `https://github.com/${data.viewer.login}.png`,
      bio: null,
      location: null,
      company: null,
      email: null,
      websiteUrl: null,
      twitterUsername: null,
    };

    this.userProfile = profile;
    return profile;
  }

  /**
   * Set user profile data directly
   */
  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;

    if (profile) {
      this.userId = profile.login; // Using login as ID since we don't have actual ID
    }
  }
}

export const userService = new UserService();

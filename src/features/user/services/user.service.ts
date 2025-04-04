import { executeGitHubQuery } from "@/api-github";
import { GetUserProfileDocument, GetViewerDocument } from "@/api-github/generated/graphql";
import { getErrorMessage } from "@/common/utils/errors.utils";

import { mapToUserProfile } from "../mappers";
import { UserApiModel } from "../types/user-api.types";
import { UserProfile } from "../types/user.types";

/**
 * Service responsible for handling user-related operations
 */
class UserService {
  private userProfile: UserProfile | null = null;

  /**
   * Check if a GitHub token exists
   */
  hasToken(): boolean {
    const token = localStorage.getItem("github_token");
    return !!token;
  }

  /**
   * Get the current user profile from memory or storage
   */
  getUserProfile(): UserProfile | null {
    if (this.userProfile) {
      return this.userProfile;
    }

    // Try to get from storage
    const storedProfile = localStorage.getItem("user_profile");
    if (storedProfile) {
      try {
        this.userProfile = JSON.parse(storedProfile) as UserProfile;
        return this.userProfile;
      } catch (error) {
        console.error("Failed to parse stored user profile:", error);
        localStorage.removeItem("user_profile");
      }
    }

    return null;
  }

  /**
   * Set the user profile in both memory and storage
   */
  setUserProfile(profile: UserProfile | null): void {
    this.userProfile = profile;
    if (profile) {
      localStorage.setItem("user_profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("user_profile");
    }
  }

  /**
   * Fetch the user's basic profile from the GitHub API
   */
  async fetchBasicProfile(): Promise<UserProfile | null> {
    try {
      const response = await executeGitHubQuery(GetUserProfileDocument);

      if (response.error || !response.data) {
        console.error("Error fetching user profile:", getErrorMessage(response.error));
        return null;
      }

      // Convert data.viewer to UserApiModel
      if (response.data.viewer) {
        const userProfile = mapToUserProfile(response.data.viewer as unknown as UserApiModel);
        this.setUserProfile(userProfile);
        return userProfile;
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch user profile:", getErrorMessage(error));
      return null;
    }
  }

  /**
   * Verify if the current GitHub token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await executeGitHubQuery(GetViewerDocument);

      if (response.error || !response.data) {
        return false;
      }

      // Check if viewer login exists
      return !!response.data.viewer?.login;
    } catch (error) {
      console.error("Token verification failed:", getErrorMessage(error));
      return false;
    }
  }

  /**
   * Clear all user data
   */
  clearUserData(): void {
    this.userProfile = null;
    localStorage.removeItem("user_profile");
    localStorage.removeItem("github_token");
  }
}

// Create a singleton instance
export const userService = new UserService();

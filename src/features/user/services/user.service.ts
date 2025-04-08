import { executeGitHubQuery } from "@/api-github";
import {
  GetUserProfileDocument,
  GetViewerDocument,
  User as GitHubUser,
} from "@/api-github/generated/graphql";
import { getErrorMessage } from "@/common/utils/errors.utils";

import { mapToUser } from "../mappers";
import { userStore } from "../stores";
import { User } from "../types/user.types";

/**
 * Service responsible for handling user-related API operations
 */
class UserService {
  /**
   * Check if a GitHub token exists
   */
  hasToken(): boolean {
    // This would be handled by environment configuration
    return true; // Default to true as token handling is managed elsewhere
  }

  /**
   * Get the current user profile from the store
   */
  getUserProfile(): User | null {
    return userStore.profile;
  }

  /**
   * Fetch the user's basic profile from the GitHub API
   */
  async fetchBasicProfile(): Promise<User | null> {
    try {
      userStore.setLoading(true);
      userStore.setError(null);

      const response = await executeGitHubQuery(GetUserProfileDocument);

      if (response.error || !response.data) {
        const error = new Error(getErrorMessage(response.error));
        console.error("Error fetching user profile:", error.message);
        userStore.setError(error);
        return null;
      }

      // Convert data.viewer to User
      if (response.data.viewer) {
        const userProfile = mapToUser(response.data.viewer as GitHubUser);
        userStore.setProfile(userProfile);
        return userProfile;
      }

      return null;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(getErrorMessage(error));
      console.error("Failed to fetch user profile:", errorObj.message);
      userStore.setError(errorObj);
      return null;
    } finally {
      userStore.setLoading(false);
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
    userStore.clearUserData();
  }
}

// Create a singleton instance
export const userService = new UserService();

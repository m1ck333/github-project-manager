/**
 * GitHub User Service
 *
 * Service class to handle GitHub user information and token validation.
 */
import { env } from "@/config/env";
import { GITHUB_URL } from "@/constants/github";
import { OPERATIONS } from "@/constants/operations";

import { GetViewerDocument, GetViewerQuery } from "../generated/graphql";
import { executeNamedQuery } from "../operationUtils";

export interface GitHubUserProfile {
  id: string;
  login: string;
  avatarUrl: string;
  url: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  hasToken: boolean;
  errorMessage: string | null;
  user?: GitHubUserProfile;
}

export class UserService {
  private static instance: UserService;
  // Cache validation result
  private validationResult: TokenValidationResult | null = null;
  // Cache user profile
  private userProfile: GitHubUserProfile | null = null;

  private constructor() {}

  /**
   * Get singleton instance of UserService
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Get the GitHub token from environment
   */
  public getToken(): string | undefined {
    return env.githubToken;
  }

  /**
   * Check if token exists
   */
  public hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Get the current user profile
   * Returns null if not authenticated
   */
  public async getUserProfile(forceRefresh = false): Promise<GitHubUserProfile | null> {
    // If we're not forcing a refresh and we have cached data, return it
    if (!forceRefresh && this.userProfile !== null) {
      return this.userProfile;
    }

    // Validate the token first
    const validationResult = await this.validateToken(forceRefresh);

    // If token is invalid, we can't get user profile
    if (!validationResult.isValid) {
      return null;
    }

    // Return the user profile from validation result
    return validationResult.user || null;
  }

  /**
   * Validate the GitHub token
   * @returns Token validation result
   */
  public async validateToken(forceRefresh = false): Promise<TokenValidationResult> {
    // Return cached result if available and not forcing refresh
    if (!forceRefresh && this.validationResult !== null) {
      return this.validationResult;
    }

    const token = this.getToken();

    // No token to validate
    if (!token) {
      this.validationResult = {
        isValid: false,
        hasToken: false,
        errorMessage: "GitHub token is missing",
      };
      return this.validationResult;
    }

    try {
      // Use named query helper for cleaner operation naming in network tab
      const { data, error } = await executeNamedQuery<GetViewerQuery, Record<string, never>>(
        GetViewerDocument,
        {},
        OPERATIONS.VALIDATE_TOKEN
      ).toPromise();

      if (error) {
        this.validationResult = {
          isValid: false,
          hasToken: true,
          errorMessage: `GraphQL error: ${error.message}`,
        };
        return this.validationResult;
      }

      if (!data || !data.viewer) {
        this.validationResult = {
          isValid: false,
          hasToken: true,
          errorMessage: "Token may not have correct permissions",
        };
        return this.validationResult;
      }

      // Create user profile from viewer data
      this.userProfile = {
        id: data.viewer.id,
        login: data.viewer.login,
        avatarUrl: data.viewer.avatarUrl,
        url: `${GITHUB_URL}/${data.viewer.login}`,
      };

      this.validationResult = {
        isValid: true,
        hasToken: true,
        errorMessage: null,
        user: this.userProfile,
      };

      return this.validationResult;
    } catch (error) {
      this.validationResult = {
        isValid: false,
        hasToken: true,
        errorMessage: `Network error: ${error instanceof Error ? error.message : String(error)}`,
      };
      return this.validationResult;
    }
  }

  /**
   * Ensure token is valid before making API calls
   * @throws Error if token is invalid or missing
   */
  public async ensureValidToken(): Promise<void> {
    const result = await this.validateToken();
    if (!result.isValid) {
      throw new Error(
        result.errorMessage ||
          "GitHub token is invalid or missing. Please check your token configuration."
      );
    }
  }
}

// Export singleton instance
export const userService = UserService.getInstance();

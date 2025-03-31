import { makeAutoObservable, runInAction } from "mobx";

import { env } from "../config/env";
import { client } from "../graphql/client";
import { GetViewerDocument } from "../graphql/operations/operation-names";
import { appInitializationService } from "../graphql/services/AppInitializationService";
import { UserProfile } from "../types";

export interface TokenValidationResult {
  isValid: boolean;
  hasToken: boolean;
  errorMessage: string | null;
  user?: UserProfile | null;
}

export class UserStore {
  userProfile: UserProfile | null = null;
  loading = false;
  error: string | null = null;
  isInitialized = false;
  validationResult: TokenValidationResult | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Set user profile from the app initialization data
   */
  setUserProfile(profile: UserProfile) {
    this.userProfile = profile;
    this.isInitialized = true;
  }

  getToken(): string | null {
    return env.githubToken;
  }

  hasToken(): boolean {
    return !!env.githubToken;
  }

  /**
   * Ensure the token is valid before proceeding
   */
  async ensureValidToken(): Promise<void> {
    if (!this.hasToken()) {
      throw new Error("No GitHub token found");
    }

    const result = await this.validateToken();
    if (!result.isValid) {
      throw new Error(result.errorMessage || "Invalid GitHub token");
    }
  }

  /**
   * Fetch user profile directly from AppInitializationService
   */
  async fetchUserProfile(forceRefresh = false) {
    this.loading = true;
    this.error = null;

    try {
      // If we need to force refresh, we'll clear the cached data
      if (forceRefresh) {
        await appInitializationService.getAllInitialData();
      }

      const userData = appInitializationService.getUserProfile();

      runInAction(() => {
        this.userProfile = userData;
        this.isInitialized = true;
        this.loading = false;
      });

      return userData;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error);
        this.loading = false;
      });
      throw error;
    }
  }

  /**
   * Validate the GitHub token
   */
  async validateToken(forceRefresh = false): Promise<TokenValidationResult> {
    this.loading = true;
    this.error = null;

    // Return cached result if available and not forcing refresh
    if (!forceRefresh && this.validationResult !== null) {
      return this.validationResult;
    }

    // Initialize token from environment variable if it exists
    if (env.githubToken && !localStorage.getItem("github_token")) {
      localStorage.setItem("github_token", env.githubToken);
    }

    const token = this.getToken();

    // No token to validate
    if (!token) {
      const result = {
        isValid: false,
        hasToken: false,
        errorMessage: "GitHub token is missing",
      };
      this.validationResult = result;
      return result;
    }

    try {
      const { data, error } = await client.query(GetViewerDocument, {}).toPromise();

      if (error) {
        const result = {
          isValid: false,
          hasToken: true,
          errorMessage: `GraphQL error: ${error.message}`,
        };

        runInAction(() => {
          this.validationResult = result;
          this.loading = false;
        });

        return result;
      }

      if (!data || !data.viewer) {
        const result = {
          isValid: false,
          hasToken: true,
          errorMessage: "Token may not have correct permissions",
        };

        runInAction(() => {
          this.validationResult = result;
          this.loading = false;
        });

        return result;
      }

      // Get the complete user profile from app initialization service
      await this.fetchUserProfile(forceRefresh);

      const result = {
        isValid: true,
        hasToken: true,
        errorMessage: null,
        user: this.userProfile,
      };

      runInAction(() => {
        this.validationResult = result;
        this.loading = false;
      });

      return result;
    } catch (error) {
      const result = {
        isValid: false,
        hasToken: true,
        errorMessage: `Network error: ${error instanceof Error ? error.message : String(error)}`,
      };

      runInAction(() => {
        this.validationResult = result;
        this.error = error instanceof Error ? error.message : String(error);
        this.loading = false;
      });

      return result;
    }
  }

  clearError() {
    this.error = null;
  }
}

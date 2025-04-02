import { makeAutoObservable, runInAction } from "mobx";

import { env } from "../config/env";
import { UserProfile } from "../core/types";
import { userService } from "../services";

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
   * Set user profile data
   */
  setUserProfile(profile: UserProfile) {
    this.userProfile = profile;
    this.isInitialized = true;
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    return env.githubToken;
  }

  /**
   * Check if the user has a token
   */
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
   * Fetch user profile via userService
   */
  async fetchUserProfile() {
    this.loading = true;
    this.error = null;

    try {
      const userProfile = await userService.fetchBasicProfile();

      runInAction(() => {
        this.userProfile = userProfile;
        this.isInitialized = true;
        this.loading = false;
      });

      return userProfile;
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
      const isValid = await userService.verifyToken();

      if (!isValid) {
        const result = {
          isValid: false,
          hasToken: true,
          errorMessage: "Token validation failed",
        };

        runInAction(() => {
          this.validationResult = result;
          this.loading = false;
        });

        return result;
      }

      // Fetch the complete user profile
      await this.fetchUserProfile();

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

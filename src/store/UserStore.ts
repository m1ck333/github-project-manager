import { makeAutoObservable, runInAction } from "mobx";

import { GitHubUserProfile, TokenValidationResult, userService } from "../graphql/services";

export class UserStore {
  userProfile: GitHubUserProfile | null = null;
  loading = false;
  error: string | null = null;
  isInitialized = false;

  constructor() {
    makeAutoObservable(this);
  }

  getToken(): string | undefined {
    return userService.getToken();
  }

  hasToken(): boolean {
    return userService.hasToken();
  }

  async ensureValidToken(): Promise<void> {
    return userService.ensureValidToken();
  }

  async fetchUserProfile(forceRefresh = false) {
    this.loading = true;
    this.error = null;

    try {
      const profile = await userService.getUserProfile(forceRefresh);

      runInAction(() => {
        this.userProfile = profile;
        this.isInitialized = true;
        this.loading = false;
      });

      return profile;
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
      throw error;
    }
  }

  async validateToken(forceRefresh = false): Promise<TokenValidationResult> {
    this.loading = true;
    this.error = null;

    try {
      const result = await userService.validateToken(forceRefresh);

      runInAction(() => {
        if (result.user) {
          this.userProfile = result.user;
        }
        this.loading = false;
      });

      return result;
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
      throw error;
    }
  }

  clearError() {
    this.error = null;
  }
}

import { makeAutoObservable } from "mobx";

import { userService } from "../services";
import { User } from "../types/user.types";

/**
 * Store for managing user profile state
 */
export class UserStore {
  private _profile: User | null = null;
  private _isLoading = false;
  private _error: Error | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Get the user profile
   */
  get profile(): User | null {
    return this._profile;
  }

  /**
   * Get loading state
   */
  get isLoading(): boolean {
    return this._isLoading;
  }

  /**
   * Get error state
   */
  get error(): Error | null {
    return this._error;
  }

  /**
   * Set the user profile
   */
  setProfile(profile: User | null): void {
    this._profile = profile;
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this._isLoading = isLoading;
  }

  /**
   * Set error state
   */
  setError(error: Error | null): void {
    this._error = error;
  }

  /**
   * Clear user data
   */
  clearUserData(): void {
    this._profile = null;
    this._error = null;
  }

  /**
   * Initialize the user store by fetching the user profile
   */
  async initialize(): Promise<boolean> {
    if (this._profile) {
      return true;
    }

    if (this._isLoading) {
      return false;
    }

    try {
      this._isLoading = true;
      this._error = null;

      const profile = await userService.fetchBasicProfile();
      return !!profile;
    } catch (error) {
      this._error = error instanceof Error ? error : new Error(String(error));
      return false;
    } finally {
      this._isLoading = false;
    }
  }
}

// Create singleton instance
export const userStore = new UserStore();

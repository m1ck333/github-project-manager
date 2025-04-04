import { makeAutoObservable } from "mobx";

import { UserProfile } from "../types";

/**
 * Store for managing user profile state
 */
export class UserStore {
  private _profile: UserProfile | null = null;
  private _isLoading = false;
  private _error: Error | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Get the user profile
   */
  get profile(): UserProfile | null {
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
  setProfile(profile: UserProfile | null): void {
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
}

// Create singleton instance
export const userStore = new UserStore();

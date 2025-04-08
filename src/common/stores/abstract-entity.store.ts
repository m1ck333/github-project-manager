/**
 * Base entity store providing common state management functionality
 * This serves as the foundation for all entity stores
 */
import { makeObservable, observable, action } from "mobx";

/**
 * Base entity store interface
 */
export interface BaseEntityStore {
  isLoading: boolean;
  error: Error | null;

  setLoading(isLoading: boolean): void;
  setError(error: Error | null): void;
  reset(): void;
}

/**
 * Abstract base class for entity stores
 * Provides common loading/error state management
 */
export abstract class AbstractEntityStore implements BaseEntityStore {
  @observable isLoading = false;
  @observable error: Error | null = null;

  constructor() {
    makeObservable(this);
  }

  /**
   * Set loading state
   */
  @action
  setLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
  }

  /**
   * Set error state
   */
  @action
  setError(error: Error | null): void {
    this.error = error;
  }

  /**
   * Reset store to initial state
   */
  @action
  reset(): void {
    this.isLoading = false;
    this.error = null;
  }
}

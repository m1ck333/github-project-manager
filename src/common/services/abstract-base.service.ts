import { makeObservable, observable, action } from "mobx";

/**
 * Base service interface for common functionality
 */
export interface IAbstractBaseService {
  isLoading: boolean;
  error: Error | null;
  setLoading(isLoading: boolean): void;
  setError(error: Error | null): void;
}

/**
 * Abstract base class for all services
 * Provides common functionality for error handling and loading states
 */
export abstract class AbstractBaseService implements IAbstractBaseService {
  @observable protected _isLoading = false;
  @observable protected _error: Error | null = null;

  constructor() {
    makeObservable(this);
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get error(): Error | null {
    return this._error;
  }

  @action
  setLoading(isLoading: boolean): void {
    this._isLoading = isLoading;
  }

  @action
  setError(error: Error | null): void {
    this._error = error;
  }

  protected async executeWithErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
    this.setLoading(true);
    this.setError(null);

    try {
      return await operation();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.setError(errorObj);
      throw errorObj;
    } finally {
      this.setLoading(false);
    }
  }
}

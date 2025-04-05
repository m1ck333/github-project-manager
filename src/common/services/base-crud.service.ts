import { makeObservable, observable, action } from "mobx";

/**
 * Base CRUD service interface for entity operations
 */
export interface BaseCrudService<T extends { id: string }> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(item: Omit<T, "id">): T;
  update(id: string, item: Partial<T>): T | undefined;
  delete(id: string): boolean;
}

/**
 * Abstract base class for CRUD operations
 * Provides common functionality for entity services
 */
export abstract class AbstractCrudService<T extends { id: string }> implements BaseCrudService<T> {
  @observable protected items: T[] = [];
  @observable protected error: Error | null = null;
  @observable protected isLoading = false;

  constructor() {
    makeObservable(this);
  }

  /**
   * Get all items
   */
  @action
  getAll(): T[] {
    return this.items;
  }

  /**
   * Get item by ID
   */
  @action
  getById(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  /**
   * Create a new item
   * Note: Actual implementation should generate an ID or call API
   */
  abstract create(item: Omit<T, "id">): T;

  /**
   * Update an existing item
   */
  @action
  update(id: string, updates: Partial<T>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;

    const updatedItem = { ...this.items[index], ...updates } as T;
    this.items[index] = updatedItem;
    return updatedItem;
  }

  /**
   * Delete an item by ID
   */
  @action
  delete(id: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length !== initialLength;
  }

  /**
   * Set items directly (e.g., from initialization service)
   */
  @action
  setItems(items: T[]): void {
    this.items = [...items];
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
   * Get current loading state
   */
  getLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Get current error
   */
  getError(): Error | null {
    return this.error;
  }
}

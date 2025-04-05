import { makeObservable, observable, action, computed, override } from "mobx";

import { AbstractEntityStore, BaseEntityStore } from "./base-entity.store";

/**
 * Base CRUD store interface for entity operations
 */
export interface BaseCrudStore<T extends { id: string }> extends BaseEntityStore {
  items: T[];

  getAll(): T[];
  getById(id: string): T | undefined;
  create(item: Omit<T, "id">): T;
  update(id: string, item: Partial<T>): T | undefined;
  delete(id: string): boolean;
  setItems(items: T[]): void;
}

/**
 * Abstract base class for CRUD operations in stores
 * Provides common functionality for entity stores
 */
export abstract class AbstractCrudStore<T extends { id: string }>
  extends AbstractEntityStore
  implements BaseCrudStore<T>
{
  @observable items: T[] = [];

  constructor() {
    super();
    makeObservable(this);
  }

  /**
   * Get all items
   */
  @computed
  get allItems(): T[] {
    return this.items;
  }

  /**
   * Get all items (method form for interface compatibility)
   */
  getAll(): T[] {
    return this.allItems;
  }

  /**
   * Get item by ID
   */
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
    const newItems = [...this.items];
    newItems[index] = updatedItem;
    this.items = newItems;
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
   * Clear all items
   */
  @action
  clearItems(): void {
    this.items = [];
  }

  /**
   * Reset store to initial state
   * Overrides the base reset method to also clear items
   */
  @override
  reset(): void {
    super.reset();
    this.items = [];
  }
}

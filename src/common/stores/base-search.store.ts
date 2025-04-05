import { makeObservable, observable, action, computed, override } from "mobx";

import { AbstractEntityStore, BaseEntityStore } from "./base-entity.store";

/**
 * Interface for search criteria
 */
export interface SearchCriteria {
  query: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, unknown>;
  page?: number;
  pageSize?: number;
}

/**
 * Base search store interface
 */
export interface BaseSearchStore<T extends { id: string }> extends BaseEntityStore {
  searchQuery: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  currentPage: number;
  pageSize: number;
  searchResults: T[];
  isSearching: boolean;
  searchError: Error | null;

  search(criteria: SearchCriteria): T[];
  setSortBy(field: string, direction: "asc" | "desc"): void;
  setSearchQuery(query: string): void;
  setFilters(filters: Record<string, unknown>): void;
  setPagination(page: number, pageSize: number): void;
}

/**
 * Abstract base class for search functionality in stores
 * Provides common search operations for entity stores
 */
export abstract class AbstractSearchStore<T extends { id: string }>
  extends AbstractEntityStore
  implements BaseSearchStore<T>
{
  @observable searchQuery: string = "";
  @observable sortField: string = "id";
  @observable sortDirection: "asc" | "desc" = "asc";
  @observable filters: Record<string, unknown> = {};
  @observable currentPage: number = 1;
  @observable pageSize: number = 10;
  @observable searchResults: T[] = [];
  @observable isSearching: boolean = false;
  @observable searchError: Error | null = null;

  constructor() {
    super();
    makeObservable(this);
  }

  /**
   * Execute search based on current criteria
   */
  abstract search(criteria: SearchCriteria): T[];

  /**
   * Set sort field and direction
   */
  @action
  setSortBy(field: string, direction: "asc" | "desc"): void {
    this.sortField = field;
    this.sortDirection = direction;
  }

  /**
   * Set search query
   */
  @action
  setSearchQuery(query: string): void {
    this.searchQuery = query;
  }

  /**
   * Set filters
   */
  @action
  setFilters(filters: Record<string, unknown>): void {
    this.filters = { ...filters };
  }

  /**
   * Set pagination parameters
   */
  @action
  setPagination(page: number, pageSize: number): void {
    this.currentPage = Math.max(1, page);
    this.pageSize = Math.max(1, pageSize);
  }

  /**
   * Set search results
   */
  @action
  protected setSearchResults(results: T[]): void {
    this.searchResults = [...results];
  }

  /**
   * Set searching state
   */
  @action
  protected setIsSearching(isSearching: boolean): void {
    this.isSearching = isSearching;
  }

  /**
   * Set search error
   */
  @action
  protected setSearchError(error: Error | null): void {
    this.searchError = error;
  }

  /**
   * Get total number of results
   */
  @computed
  get totalResults(): number {
    return this.searchResults.length;
  }

  /**
   * Get total pages
   */
  @computed
  get totalPages(): number {
    return Math.ceil(this.totalResults / this.pageSize) || 1;
  }

  /**
   * Get current page results
   */
  @computed
  get paginatedResults(): T[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.searchResults.slice(start, end);
  }

  /**
   * Reset search parameters to defaults
   * Overrides the base reset method to also reset search-specific state
   */
  @override
  reset(): void {
    super.reset();
    this.searchQuery = "";
    this.sortField = "id";
    this.sortDirection = "asc";
    this.filters = {};
    this.currentPage = 1;
    this.pageSize = 10;
    this.searchResults = [];
    this.isSearching = false;
    this.searchError = null;
  }
}

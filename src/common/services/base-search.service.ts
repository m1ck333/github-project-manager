import { makeObservable, observable, action } from "mobx";

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
 * Base search service interface
 */
export interface BaseSearchService<T extends { id: string }> {
  search(criteria: SearchCriteria): T[];
  setSortBy(field: string, direction: "asc" | "desc"): void;
  setSearchQuery(query: string): void;
  setFilters(filters: Record<string, unknown>): void;
  setPagination(page: number, pageSize: number): void;
  getSearchResults(): T[];
  getTotalResults(): number;
  getCurrentPage(): number;
}

/**
 * Abstract base class for search functionality
 * Provides common search operations for entities
 */
export abstract class AbstractSearchService<T extends { id: string }>
  implements BaseSearchService<T>
{
  @observable protected searchQuery: string = "";
  @observable protected sortField: string = "id";
  @observable protected sortDirection: "asc" | "desc" = "asc";
  @observable protected filters: Record<string, unknown> = {};
  @observable protected currentPage: number = 1;
  @observable protected pageSize: number = 10;
  @observable protected searchResults: T[] = [];
  @observable protected isSearching: boolean = false;
  @observable protected searchError: Error | null = null;

  constructor() {
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
   * Get current search results
   */
  getSearchResults(): T[] {
    return this.searchResults;
  }

  /**
   * Get total number of results
   */
  get totalResults(): number {
    return this.searchResults.length;
  }

  getTotalResults(): number {
    return this.totalResults;
  }

  /**
   * Get current page
   */
  getCurrentPage(): number {
    return this.currentPage;
  }

  /**
   * Get page size
   */
  getPageSize(): number {
    return this.pageSize;
  }

  /**
   * Get search query
   */
  getSearchQuery(): string {
    return this.searchQuery;
  }

  /**
   * Get sort field
   */
  getSortField(): string {
    return this.sortField;
  }

  /**
   * Get sort direction
   */
  getSortDirection(): "asc" | "desc" {
    return this.sortDirection;
  }

  /**
   * Get filters
   */
  getFilters(): Record<string, unknown> {
    return { ...this.filters };
  }

  /**
   * Get searching state
   */
  isLoading(): boolean {
    return this.isSearching;
  }

  /**
   * Get search error
   */
  getError(): Error | null {
    return this.searchError;
  }

  /**
   * Reset search parameters to defaults
   */
  @action
  reset(): void {
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

import { makeObservable, observable, action } from "mobx";

import { AbstractBaseService, IAbstractBaseService } from "./abstract-base.service";

/**
 * Interface for search criteria
 */
export interface ISearchCriteria {
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
export interface IAbstractSearchService<T extends { id: string }> extends IAbstractBaseService {
  searchQuery: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  filters: Record<string, unknown>;
  currentPage: number;
  pageSize: number;
  searchResults: T[];
  isSearching: boolean;
  searchError: Error | null;

  search(criteria: ISearchCriteria): T[];
  setSortBy(field: string, direction: "asc" | "desc"): void;
  setSearchQuery(query: string): void;
  setFilters(filters: Record<string, unknown>): void;
  setPagination(page: number, pageSize: number): void;
  getSearchResults(): T[];
  getTotalResults(): number;
  getCurrentPage(): number;
  reset(): void;
}

/**
 * Abstract base class for search functionality
 * Provides common search operations for entities
 */
export abstract class AbstractSearchService<T extends { id: string }>
  extends AbstractBaseService
  implements IAbstractSearchService<T>
{
  @observable protected _searchQuery: string = "";
  @observable protected _sortField: string = "id";
  @observable protected _sortDirection: "asc" | "desc" = "asc";
  @observable protected _filters: Record<string, unknown> = {};
  @observable protected _currentPage: number = 1;
  @observable protected _pageSize: number = 10;
  @observable protected _searchResults: T[] = [];
  @observable protected _isSearching: boolean = false;
  @observable protected _searchError: Error | null = null;

  constructor() {
    super();
    makeObservable(this);
  }

  get searchQuery(): string {
    return this._searchQuery;
  }

  get sortField(): string {
    return this._sortField;
  }

  get sortDirection(): "asc" | "desc" {
    return this._sortDirection;
  }

  get filters(): Record<string, unknown> {
    return this._filters;
  }

  get currentPage(): number {
    return this._currentPage;
  }

  get pageSize(): number {
    return this._pageSize;
  }

  get searchResults(): T[] {
    return this._searchResults;
  }

  get isSearching(): boolean {
    return this._isSearching;
  }

  get searchError(): Error | null {
    return this._searchError;
  }

  /**
   * Execute search based on current criteria
   */
  abstract search(criteria: ISearchCriteria): T[];

  /**
   * Set sort field and direction
   */
  @action
  setSortBy(field: string, direction: "asc" | "desc"): void {
    this._sortField = field;
    this._sortDirection = direction;
  }

  /**
   * Set search query
   */
  @action
  setSearchQuery(query: string): void {
    this._searchQuery = query;
  }

  /**
   * Set filters
   */
  @action
  setFilters(filters: Record<string, unknown>): void {
    this._filters = { ...filters };
  }

  /**
   * Set pagination parameters
   */
  @action
  setPagination(page: number, pageSize: number): void {
    this._currentPage = Math.max(1, page);
    this._pageSize = Math.max(1, pageSize);
  }

  /**
   * Set search results
   */
  @action
  protected setSearchResults(results: T[]): void {
    this._searchResults = [...results];
  }

  /**
   * Set searching state
   */
  @action
  protected setSearching(isSearching: boolean): void {
    this._isSearching = isSearching;
  }

  /**
   * Set search error
   */
  @action
  protected setSearchError(error: Error | null): void {
    this._searchError = error;
  }

  /**
   * Get search results
   */
  getSearchResults(): T[] {
    return this._searchResults;
  }

  /**
   * Get total number of results
   */
  getTotalResults(): number {
    return this._searchResults.length;
  }

  /**
   * Get current page
   */
  getCurrentPage(): number {
    return this._currentPage;
  }

  /**
   * Reset search state
   */
  @action
  reset(): void {
    this._searchQuery = "";
    this._sortField = "id";
    this._sortDirection = "asc";
    this._filters = {};
    this._currentPage = 1;
    this._searchResults = [];
    this._isSearching = false;
    this._searchError = null;
  }
}

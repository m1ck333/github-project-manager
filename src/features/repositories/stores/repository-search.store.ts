import { makeObservable, observable, action, configure, override } from "mobx";

import { AbstractSearchStore, SearchCriteria } from "@/common/stores";
import { compareDatesAsc } from "@/common/utils/date.utils";

import { Repository } from "../types/repository";

// Enable strict mode for MobX
configure({ enforceActions: "observed" });

/**
 * Store responsible for repository search functionality
 * Extends the AbstractSearchStore to leverage common search functionality
 */
export class RepositorySearchStore extends AbstractSearchStore<Repository> {
  // Additional repository-specific filters
  @observable visibilityFilter: "all" | "public" | "private" = "all";

  constructor() {
    super();
    makeObservable(this);
  }

  /**
   * Set visibility filter
   */
  @action
  setVisibilityFilter(filter: "all" | "public" | "private"): void {
    this.visibilityFilter = filter;
  }

  /**
   * Reset all filters to default values
   * Overrides the base class reset to include repository-specific filters
   */
  @override
  reset(): void {
    super.reset();
    this.visibilityFilter = "all";
  }

  /**
   * Search repositories based on criteria
   * Implements the abstract method from AbstractSearchStore
   */
  search(criteria: SearchCriteria): Repository[] {
    // Update search state from criteria
    this.setSearchQuery(criteria.query);

    if (criteria.sortBy) {
      const sortField = this.mapSortField(criteria.sortBy);
      const sortDirection = criteria.sortDirection || "asc";
      this.setSortBy(sortField, sortDirection as "asc" | "desc");
    }

    if (criteria.page) {
      this.setPagination(criteria.page, criteria.pageSize || this.pageSize);
    }

    // If visibility filter is provided in criteria
    if (criteria.filters && typeof criteria.filters.visibility === "string") {
      this.setVisibilityFilter(criteria.filters.visibility as "all" | "public" | "private");
    }

    // Filter and return results
    return this.searchRepositories();
  }

  /**
   * Helper to map generic sort fields to repository-specific fields
   */
  private mapSortField(sortBy: string): string {
    switch (sortBy) {
      case "name":
      case "created":
      case "updated":
        return sortBy;
      default:
        return "name";
    }
  }

  /**
   * Search repositories with the current filters
   */
  searchRepositories(): Repository[] {
    // Get full result set based on current filters
    const filteredResults = this.filterRepositories();

    // Store and return filtered results
    this.setSearchResults(filteredResults);
    return filteredResults;
  }

  /**
   * Filter repositories based on current filters
   */
  private filterRepositories(): Repository[] {
    // We would typically get this from a service or parent store
    // For this example, we'll use the searchResults as our data source
    let filteredRepos = [...this.searchResults];

    // Apply text search filter
    if (this.searchQuery.trim()) {
      const normalizedQuery = this.searchQuery.toLowerCase().trim();
      filteredRepos = filteredRepos.filter((repo) => {
        const nameMatch = repo.name.toLowerCase().includes(normalizedQuery);
        const descMatch = repo.description?.toLowerCase().includes(normalizedQuery) || false;
        const ownerMatch = repo.owner.login.toLowerCase().includes(normalizedQuery);

        return nameMatch || descMatch || ownerMatch;
      });
    }

    // Apply visibility filter
    if (this.visibilityFilter !== "all") {
      const isPrivate = this.visibilityFilter === "private";
      filteredRepos = filteredRepos.filter((repo) => {
        // For GitHub repositories, check the isPrivate flag
        if (typeof repo.isPrivate === "boolean") {
          return repo.isPrivate === isPrivate;
        }

        // For other repositories or those missing the isPrivate flag
        // Try to determine from visibility
        if (repo.visibility) {
          return isPrivate
            ? repo.visibility.toUpperCase() === "PRIVATE"
            : repo.visibility.toUpperCase() === "PUBLIC";
        }

        // Default to showing all if we can't determine
        return true;
      });
    }

    // Apply sorting
    filteredRepos.sort((a, b) => {
      let comparison = 0;

      switch (this.sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "created":
          comparison = compareDatesAsc(a.createdAt, b.createdAt);
          break;
        case "updated":
          comparison = compareDatesAsc(a.updatedAt, b.updatedAt);
          break;
      }

      return this.sortDirection === "asc" ? comparison : -comparison;
    });

    return filteredRepos;
  }
}

// Singleton instance
export const repositorySearchStore = new RepositorySearchStore();

import { makeAutoObservable, action, configure } from "mobx";

import { compareDatesAsc } from "@/common/utils/date.utils";

import { Repository } from "../types/repository";

// Enable strict mode for MobX
configure({ enforceActions: "observed" });

/**
 * Store responsible for repository search functionality
 */
export class RepositorySearchStore {
  searchQuery = "";
  visibilityFilter: "all" | "public" | "private" = "all";
  sortBy: "name" | "created" | "updated" = "name";
  sortDirection: "asc" | "desc" = "asc";

  constructor() {
    makeAutoObservable(this, {
      // Explicitly mark methods as actions
      setSearchQuery: action,
      setVisibilityFilter: action,
      setSortOptions: action,
      resetFilters: action,
    });
  }

  /**
   * Set search query
   */
  setSearchQuery = (query: string) => {
    this.searchQuery = query;
  };

  /**
   * Set visibility filter
   */
  setVisibilityFilter = (filter: "all" | "public" | "private") => {
    this.visibilityFilter = filter;
  };

  /**
   * Set sort options
   */
  setSortOptions = (
    sortBy: "name" | "created" | "updated",
    sortDirection: "asc" | "desc" = "asc"
  ) => {
    this.sortBy = sortBy;
    this.sortDirection = sortDirection;
  };

  /**
   * Reset all filters to default values
   */
  resetFilters = () => {
    this.searchQuery = "";
    this.visibilityFilter = "all";
    this.sortBy = "name";
    this.sortDirection = "asc";
  };

  /**
   * Search repositories by name, description, or owner
   */
  searchRepositories(repositories: Repository[]): Repository[] {
    let filteredRepos = [...repositories];

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

      switch (this.sortBy) {
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

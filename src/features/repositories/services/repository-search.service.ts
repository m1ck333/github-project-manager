import { makeAutoObservable } from "mobx";

import { repositoryStore } from "../stores";
import { Repository } from "../types/repository";

/**
 * Service responsible for repository search functionality
 */
export class RepositorySearchService {
  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Search repositories by name or description
   * @param query Search query string
   * @returns Filtered list of repositories
   */
  searchRepositories(query: string): Repository[] {
    return repositoryStore.searchRepositories(query);
  }

  /**
   * Search repositories by visibility
   * @param visibility Visibility filter (public, private, all)
   * @returns Filtered list of repositories
   */
  filterByVisibility(visibility: "all" | "public" | "private"): Repository[] {
    // Set the visibility filter in the store
    repositoryStore.search.setVisibilityFilter(visibility);

    // Return filtered repositories
    return repositoryStore.search.searchRepositories(repositoryStore.repositories);
  }

  /**
   * Sort repositories by a specific field
   * @param sortBy Field to sort by
   * @param sortDirection Sort direction (asc or desc)
   * @returns Sorted list of repositories
   */
  sortRepositories(
    sortBy: "name" | "created" | "updated",
    sortDirection: "asc" | "desc" = "desc"
  ): Repository[] {
    // Set sort options in the store
    repositoryStore.search.setSortOptions(sortBy, sortDirection);

    // Return sorted repositories
    return repositoryStore.search.searchRepositories(repositoryStore.repositories);
  }
}

// Singleton instance
export const repositorySearchService = new RepositorySearchService();

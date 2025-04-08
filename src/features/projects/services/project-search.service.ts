import { action, override } from "mobx";

import { AbstractSearchService, ISearchCriteria } from "@/common/services";
import { ColumnType } from "@/features/columns/types/column.types";

import { projectStore } from "../stores";
import { Project } from "../types";
import { filterByLabels, filterByStatus, searchProjectText, sortProjects } from "../utils";

/**
 * Service for project search functionality
 */
export class ProjectSearchService extends AbstractSearchService<Project> {
  // Project-specific filters
  private labelFilter: string[] = [];
  private statusFilter: ColumnType[] = [];

  @action
  setLabelFilter(labelIds: string[]): void {
    this.labelFilter = labelIds;
  }

  @action
  setStatusFilter(columnTypes: ColumnType[]): void {
    this.statusFilter = columnTypes;
  }

  @override
  reset(): void {
    super.reset();
    this.labelFilter = [];
    this.statusFilter = [];
  }

  /**
   * Search projects based on criteria
   */
  search(criteria: ISearchCriteria): Project[] {
    try {
      this.setSearching(true);

      // Update search state from criteria
      this.setSearchQuery(criteria.query);

      if (criteria.sortBy) {
        this.setSortBy(criteria.sortBy, (criteria.sortDirection as "asc" | "desc") || "asc");
      }

      if (criteria.page) {
        this.setPagination(criteria.page, criteria.pageSize || this.pageSize);
      }

      // Set project-specific filters if provided
      if (criteria.filters) {
        if (criteria.filters.labels && Array.isArray(criteria.filters.labels)) {
          this.setLabelFilter(criteria.filters.labels as string[]);
        }

        if (criteria.filters.status && Array.isArray(criteria.filters.status)) {
          this.setStatusFilter(criteria.filters.status as ColumnType[]);
        }
      }

      // Get all projects and apply filters
      const results = this.applyFilters(projectStore.projects);
      this.setSearchResults(results);
      return results;
    } catch (error) {
      this.setSearchError(error instanceof Error ? error : new Error("Search failed"));
      return [];
    } finally {
      this.setSearching(false);
    }
  }

  /**
   * Filter projects by label
   */
  filterByLabels(labelIds: string[]): Project[] {
    try {
      this.setSearching(true);
      this.setLabelFilter(labelIds);

      const results = this.applyFilters(projectStore.projects);
      this.setSearchResults(results);
      return results;
    } catch (error) {
      this.setSearchError(error instanceof Error ? error : new Error("Failed to filter by labels"));
      return [];
    } finally {
      this.setSearching(false);
    }
  }

  /**
   * Filter projects by status
   */
  filterByStatus(columnTypes: ColumnType[]): Project[] {
    try {
      this.setSearching(true);
      this.setStatusFilter(columnTypes);

      const results = this.applyFilters(projectStore.projects);
      this.setSearchResults(results);
      return results;
    } catch (error) {
      this.setSearchError(error instanceof Error ? error : new Error("Failed to filter by status"));
      return [];
    } finally {
      this.setSearching(false);
    }
  }

  /**
   * Apply all filters and sorting to projects
   */
  private applyFilters(projects: Project[]): Project[] {
    // Apply text search
    let results = projects.filter((project) => searchProjectText(project, this.searchQuery));

    // Apply label filter
    if (this.labelFilter.length > 0) {
      results = filterByLabels(results, this.labelFilter);
    }

    // Apply status filter
    if (this.statusFilter.length > 0) {
      results = filterByStatus(results, this.statusFilter);
    }

    // Apply sorting
    if (this.sortField) {
      results = sortProjects(results, this.sortField, this.sortDirection);
    }

    // Apply pagination if needed
    if (this.currentPage > 1 || this.pageSize < results.length) {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, results.length);
      results = results.slice(startIndex, endIndex);
    }

    return results;
  }
}

// Create a singleton instance
export const projectSearchService = new ProjectSearchService();

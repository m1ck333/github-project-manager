import { action, override } from "mobx";

import { AbstractSearchService, SearchCriteria } from "@/common/services";
import { compareDatesAsc } from "@/common/utils/date.utils";

import { projectStore } from "../stores";

import type { Project, Label, ColumnType } from "../types";

/**
 * Service responsible for project search functionality
 * Extends AbstractSearchService to leverage common search functionality
 */
export class ProjectSearchService extends AbstractSearchService<Project> {
  // Project-specific filters
  private labelFilter: string[] = [];
  private statusFilter: ColumnType[] = [];

  /**
   * Set label filter
   */
  @action
  setLabelFilter(labelIds: string[]): void {
    this.labelFilter = labelIds;
  }

  /**
   * Set status filter
   */
  @action
  setStatusFilter(columnTypes: ColumnType[]): void {
    this.statusFilter = columnTypes;
  }

  /**
   * Reset all filters
   * Overrides the base class reset to include project-specific filters
   */
  @override
  reset(): void {
    super.reset();
    this.labelFilter = [];
    this.statusFilter = [];
  }

  /**
   * Search projects based on criteria
   * Implements the abstract method from AbstractSearchService
   */
  search(criteria: SearchCriteria): Project[] {
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

    // Get projects from store
    const allProjects = projectStore.projects;

    // Apply filters and update search results
    const filteredProjects = this.applyFilters(allProjects);
    this.setSearchResults(filteredProjects);

    // Return search results
    return this.getSearchResults();
  }

  /**
   * Filter projects by label
   */
  filterByLabels(labelIds: string[]): Project[] {
    this.setLabelFilter(labelIds);
    return this.applyFilters(projectStore.projects);
  }

  /**
   * Filter projects by status
   */
  filterByStatus(columnTypes: ColumnType[]): Project[] {
    this.setStatusFilter(columnTypes);
    return this.applyFilters(projectStore.projects);
  }

  /**
   * Apply all current filters and sorting to the projects list
   */
  private applyFilters(projects: Project[]): Project[] {
    let filteredProjects = [...projects];

    // Apply text search filter
    if (this.searchQuery.trim()) {
      const normalizedQuery = this.searchQuery.toLowerCase().trim();
      filteredProjects = filteredProjects.filter((project) => {
        const nameMatch = project.name.toLowerCase().includes(normalizedQuery);
        const descMatch = project.description?.toLowerCase().includes(normalizedQuery) || false;
        return nameMatch || descMatch;
      });
    }

    // Apply label filter
    if (this.labelFilter.length > 0) {
      filteredProjects = filteredProjects.filter((project) => {
        if (!project.labels || project.labels.length === 0) {
          return false;
        }

        // Check if project has at least one of the filtered labels
        return project.labels.some((label) => this.labelFilter.includes(label.id));
      });
    }

    // Apply status filter
    if (this.statusFilter.length > 0) {
      filteredProjects = filteredProjects.filter((project) => {
        if (!project.columns || project.columns.length === 0) {
          return false;
        }

        // Check if project has at least one of the filtered column types
        return project.columns.some((column) => this.statusFilter.includes(column.type));
      });
    }

    // Apply sorting
    filteredProjects.sort((a, b) => {
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
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return this.sortDirection === "asc" ? comparison : -comparison;
    });

    return filteredProjects;
  }

  /**
   * Find labels across all projects
   */
  getAllLabels(): Label[] {
    const labelsMap = new Map<string, Label>();

    projectStore.projects.forEach((project) => {
      if (project.labels && project.labels.length > 0) {
        project.labels.forEach((label) => {
          if (!labelsMap.has(label.id)) {
            labelsMap.set(label.id, label);
          }
        });
      }
    });

    return Array.from(labelsMap.values());
  }
}

// Create a singleton instance
export const projectSearchService = new ProjectSearchService();

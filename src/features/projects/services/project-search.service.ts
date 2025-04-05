import { makeAutoObservable, action } from "mobx";

import { compareDatesAsc } from "@/common/utils/date.utils";

import { projectStore } from "../stores";
import { Project, Label, ColumnType } from "../types";

/**
 * Service responsible for project search functionality
 */
export class ProjectSearchService {
  // Search parameters
  private searchQuery = "";
  private labelFilter: string[] = [];
  private statusFilter: ColumnType[] = [];
  private sortBy: "name" | "created" | "updated" = "name";
  private sortDirection: "asc" | "desc" = "asc";

  constructor() {
    makeAutoObservable(this, {
      // Mark methods that modify state as actions
      setSearchQuery: action,
      setLabelFilter: action,
      setStatusFilter: action,
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
   * Set label filter
   */
  setLabelFilter = (labelIds: string[]) => {
    this.labelFilter = labelIds;
  };

  /**
   * Set status filter
   */
  setStatusFilter = (columnTypes: ColumnType[]) => {
    this.statusFilter = columnTypes;
  };

  /**
   * Set sort options
   */
  setSortOptions = (
    sortBy: "name" | "created" | "updated" = "name",
    sortDirection: "asc" | "desc" = "asc"
  ) => {
    this.sortBy = sortBy;
    this.sortDirection = sortDirection;
  };

  /**
   * Reset all filters
   */
  resetFilters = () => {
    this.searchQuery = "";
    this.labelFilter = [];
    this.statusFilter = [];
    this.sortBy = "name";
    this.sortDirection = "asc";
  };

  /**
   * Search projects by name or description
   * @param query Search query
   * @returns Filtered list of projects
   */
  searchProjects(query: string): Project[] {
    this.setSearchQuery(query);
    return this.applyFilters(projectStore.projects);
  }

  /**
   * Filter projects by label
   * @param labelIds Array of label IDs
   * @returns Filtered list of projects
   */
  filterByLabels(labelIds: string[]): Project[] {
    this.setLabelFilter(labelIds);
    return this.applyFilters(projectStore.projects);
  }

  /**
   * Filter projects by status
   * @param columnTypes Array of column types
   * @returns Filtered list of projects
   */
  filterByStatus(columnTypes: ColumnType[]): Project[] {
    this.setStatusFilter(columnTypes);
    return this.applyFilters(projectStore.projects);
  }

  /**
   * Sort projects by a specific field
   * @param sortBy Field to sort by
   * @param sortDirection Sort direction
   * @returns Sorted list of projects
   */
  sortProjects(
    sortBy: "name" | "created" | "updated" = "name",
    sortDirection: "asc" | "desc" = "asc"
  ): Project[] {
    this.setSortOptions(sortBy, sortDirection);
    return this.applyFilters(projectStore.projects);
  }

  /**
   * Apply all current filters and sorting to the projects list
   * @param projects List of projects to filter
   * @returns Filtered and sorted projects
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

    return filteredProjects;
  }

  /**
   * Find labels across all projects
   * @returns Array of unique labels
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

// Singleton instance
export const projectSearchService = new ProjectSearchService();

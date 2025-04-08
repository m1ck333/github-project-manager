import { action, makeObservable } from "mobx";

import { AbstractEntityStore } from "@/common/stores";

import { projectSearchService } from "../services";

import { ProjectStateManager } from "./project-state";

import type { Project } from "../types";

/**
 * Handles search operations for projects
 */
export class ProjectSearchStore extends AbstractEntityStore {
  constructor(private stateManager: ProjectStateManager) {
    super();
    makeObservable(this);
  }

  /**
   * Search projects by query
   */
  @action
  searchProjects(query: string, sortBy?: string, sortDirection?: "asc" | "desc"): Project[] {
    this.setLoading(true);

    const searchParams = { query, sortBy, sortDirection };
    const results = projectSearchService.search(searchParams);
    this.stateManager.setProjects(results);

    this.setLoading(false);
    return results;
  }

  /**
   * Filter projects by labels
   */
  @action
  filterProjectsByLabels(labelIds: string[]): Project[] {
    const results = projectSearchService.filterByLabels(labelIds);
    this.stateManager.setProjects(results);
    return results;
  }

  /**
   * Reset store
   */
  reset(): void {
    super.reset();
  }
}

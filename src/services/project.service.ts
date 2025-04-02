import { GetAllInitialDataDocument } from "../api/operations/operation-names";
import { GithubProjectData, GithubViewerData, mapToProject } from "../core/mappers/project.mapper";
import { Project, BoardIssue, Column } from "../core/types";

import { graphQLClientService } from "./graphql-client.service";

/**
 * Service responsible for project-related operations
 */
export class ProjectService {
  private projects: Project[] = [];

  /**
   * Get all projects
   */
  getProjects(): Project[] {
    return this.projects;
  }

  /**
   * Find a project by ID
   */
  getProjectById(id: string): Project | undefined {
    return this.projects.find((project) => project.id === id);
  }

  /**
   * Get columns for a specific project
   */
  getProjectColumns(projectId: string): Column[] {
    const project = this.getProjectById(projectId);
    return project?.columns || [];
  }

  /**
   * Get issues for a specific project
   */
  getProjectIssues(projectId: string): BoardIssue[] {
    const project = this.getProjectById(projectId);
    return project?.issues || [];
  }

  /**
   * Fetch projects from GitHub API
   */
  async fetchProjects(): Promise<Project[]> {
    const data = await graphQLClientService.query(GetAllInitialDataDocument, {});

    if (!data.viewer || !data.viewer.projectsV2 || !data.viewer.projectsV2.nodes) {
      throw new Error("Failed to fetch projects");
    }

    // Transform projects from the GraphQL response
    const projects: Project[] = (data.viewer.projectsV2.nodes || [])
      .filter(Boolean)
      .map((project) => {
        if (!project) return null;
        return mapToProject(
          project as unknown as GithubProjectData,
          data.viewer as unknown as GithubViewerData
        );
      })
      .filter(Boolean) as Project[];

    this.projects = projects;
    return projects;
  }

  /**
   * Set projects directly
   */
  setProjects(projects: Project[]): void {
    this.projects = projects;
  }
}

export const projectService = new ProjectService();

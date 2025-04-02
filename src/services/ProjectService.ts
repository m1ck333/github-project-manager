import { GetAllInitialDataDocument } from "../api/operations/operation-names";
import { BoardIssue, Column, ColumnType, Project } from "../types";

import { graphQLClientService } from "./GraphQLClientService";

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

        // Find or create the status field
        const fields = project.fields?.nodes || [];
        const statusFields = fields.filter(
          (f) => f?.dataType === "SINGLE_SELECT" && f.name && f.id
        );

        // Prioritize a field named "Status"
        const statusField = statusFields.find((f) => f?.name === "Status") || statusFields[0];

        // Create columns from the status field
        const columns: Column[] = [];

        // Add a "No Status" column
        columns.push({
          id: "no-status",
          name: "No Status",
          type: ColumnType.TODO,
        });

        // Add columns from the status field options
        if (statusField && "options" in statusField) {
          const options = statusField.options || [];

          options.forEach((option) => {
            if (!option || !option.id || !option.name) return;

            // Determine column type based on name
            let columnType = ColumnType.TODO;
            const lowerName = option.name.toLowerCase();

            if (lowerName.includes("done")) {
              columnType = ColumnType.DONE;
            } else if (lowerName.includes("progress")) {
              columnType = ColumnType.IN_PROGRESS;
            } else if (lowerName.includes("backlog")) {
              columnType = ColumnType.BACKLOG;
            }

            columns.push({
              id: option.id,
              name: option.name,
              type: columnType,
              fieldId: statusField.id,
              fieldName: statusField.name,
            });
          });
        }

        // Process project items into issues
        const issues: BoardIssue[] = [];
        const projectItems = project.items?.nodes || [];

        projectItems.forEach((item) => {
          if (!item || !item.content) return;

          const content = item.content;
          if (content.__typename !== "Issue") return;

          // Find which column this issue belongs to
          let columnId = "no-status";
          let status = "No Status";

          // Check field values to determine status
          const fieldValues = item.fieldValues?.nodes || [];
          const statusValue = fieldValues.find(
            (fv) => fv?.__typename === "ProjectV2ItemFieldSingleSelectValue"
          );

          if (statusValue && "optionId" in statusValue) {
            columnId = statusValue.optionId as string;
            status = statusValue.name || "No Status";
          }

          // Create the issue
          const issue: BoardIssue = {
            id: item.id,
            issueId: content.id,
            title: content.title,
            body: content.body || "",
            number: content.number,
            status,
            columnId,
            labels: (content.labels?.nodes || []).filter(Boolean).map((label) => ({
              id: label!.id,
              name: label!.name,
              color: `#${label!.color}`,
              description: label!.description || "",
            })),
            url: content.url,
            author: content.author
              ? {
                  login: content.author.login,
                  avatarUrl: content.author.avatarUrl,
                }
              : null,
            assignees: (content.assignees?.nodes || []).filter(Boolean).map((assignee) => ({
              id: assignee!.id,
              login: assignee!.login,
              avatarUrl: assignee!.avatarUrl,
            })),
            createdAt: content.createdAt,
            updatedAt: content.updatedAt,
          };

          issues.push(issue);
        });

        // Get project repositories
        const projectRepositories = (project.repositories?.nodes || [])
          .filter(Boolean)
          .map((repo) => ({
            id: repo!.id,
            name: repo!.name,
            owner: {
              login: repo!.owner.login,
              avatar_url: repo!.owner.avatarUrl,
            },
            html_url: repo!.url,
          }));

        // Create the final project
        return {
          id: project.id,
          name: project.title,
          description: project.shortDescription || "",
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          url: project.url,
          html_url: project.url,
          createdBy: {
            login: data.viewer.login,
            avatarUrl: data.viewer.avatarUrl,
          },
          owner: {
            login: data.viewer.login,
            avatar_url: data.viewer.avatarUrl,
          },
          columns,
          issues,
          repositories: projectRepositories,
          collaborators: [],
        };
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

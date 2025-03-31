import { makeAutoObservable, runInAction } from "mobx";

import { ColumnService } from "../graphql/services/ColumnService";
import { IssueService } from "../graphql/services/IssueService";
import { LabelService } from "../graphql/services/LabelService";
import { ProjectService } from "../graphql/services/ProjectService";
import { RepositoryService } from "../graphql/services/RepositoryService";
import { Project, BoardIssue, Column, Label, ColumnType, Repository } from "../types";

export class ProjectStore {
  // Data
  projects: Project[] = [];
  repositories: Repository[] = [];
  currentProject: Project | null = null;
  columns: Column[] = [];
  issues: BoardIssue[] = [];
  labels: Label[] = [];

  // Services
  private projectService = new ProjectService();
  private repositoryService = new RepositoryService();
  private labelService = new LabelService();
  private issueService = new IssueService();
  private columnService = new ColumnService();

  // UI States
  loading = false;
  error: string | null = null;
  issuesVisible = true;

  constructor() {
    makeAutoObservable(this);
  }

  // Initialize store with all necessary data
  async initialize() {
    this.setLoading(true);

    try {
      // Load all projects
      await this.loadProjects();

      // Load repositories
      await this.loadRepositories();
    } catch (error) {
      console.error("Failed to initialize store:", error);
      this.setError("Failed to load initial data");
    } finally {
      this.setLoading(false);
    }
  }

  // Load projects
  async loadProjects() {
    try {
      const projects = await this.projectService.getProjects();

      runInAction(() => {
        this.projects = projects || [];
      });

      return projects;
    } catch (error) {
      console.error("Error loading projects:", error);
      this.setError("Failed to load projects");
      return [];
    }
  }

  // Load repositories
  async loadRepositories() {
    try {
      const repositories = await this.repositoryService.getUserRepositories();

      runInAction(() => {
        this.repositories = repositories || [];

        // If we have repositories, load labels for the first one
        if (repositories && repositories.length > 0) {
          this.loadLabelsForRepository(repositories[0].id);
        }
      });

      return repositories;
    } catch (error) {
      console.error("Error loading repositories:", error);
      this.setError("Failed to load repositories");
      return [];
    }
  }

  // Load labels for a repository
  async loadLabelsForRepository(repositoryId: string) {
    try {
      const labels = await this.labelService.getLabels(repositoryId);

      runInAction(() => {
        this.labels = labels || [];
      });

      return labels;
    } catch (error) {
      console.error("Error loading labels:", error);
      this.setError("Failed to load labels");
      return [];
    }
  }

  // Set current project and load its data
  async loadProject(projectId: string) {
    this.setLoading(true);
    this.setIssuesVisible(false);
    this.setError(null);

    try {
      // Try using the simplified query first
      const projectData = await this.projectService.getProjectColumnsAndIssues(projectId);

      if (projectData) {
        runInAction(() => {
          // Find and set the current project
          const project = this.projects.find((p) => p.id === projectId) || null;
          this.currentProject = project;

          // Set data
          this.columns = projectData.columns || [];
          this.issues = projectData.issues || [];
        });
      } else {
        // Fallback to separate requests
        await this.loadProjectFallback(projectId);
      }
    } catch (error) {
      console.error("Error loading project:", error);
      this.setError("Failed to load project data");
    } finally {
      // Make sure issues are visible and loading is done
      setTimeout(() => {
        runInAction(() => {
          this.issuesVisible = true;
          this.loading = false;
        });
      }, 200);
    }
  }

  // Fallback method for loading project data separately
  private async loadProjectFallback(projectId: string) {
    try {
      // Get columns
      const columns = await this.columnService.getColumns(projectId);

      // Get issues
      const issues = await this.issueService.getProjectIssues(projectId);

      runInAction(() => {
        // Find and set the current project
        const project = this.projects.find((p) => p.id === projectId) || null;
        this.currentProject = project;

        this.columns = columns || [];
        this.issues = issues || [];
      });
    } catch (error) {
      console.error("Error in fallback loading:", error);
      throw error;
    }
  }

  // Add a new column
  async addColumn(name: string, type: ColumnType) {
    if (!this.currentProject) return null;

    try {
      const columnData = { name, type };
      const newColumn = await this.columnService.addColumn(this.currentProject.id, columnData);

      if (newColumn) {
        runInAction(() => {
          this.columns.push(newColumn);
        });
      }

      return newColumn;
    } catch (error) {
      console.error("Error adding column:", error);
      this.setError("Failed to add column");
      return null;
    }
  }

  // Create a new issue
  async createIssue(title: string, body?: string, columnId?: string) {
    if (!this.currentProject || this.repositories.length === 0) return null;

    try {
      const repositoryId = this.repositories[0].id;

      const createdIssue = await this.issueService.createIssue(
        repositoryId,
        title,
        body,
        this.currentProject.id
      );

      if (createdIssue && columnId) {
        // Get the status field - we need this for GitHub Projects
        const statusFieldId = await this.columnService.getStatusFieldId(this.currentProject.id);

        if (statusFieldId) {
          // Timeout to let GitHub index the new issue
          setTimeout(async () => {
            try {
              await this.issueService.updateIssueStatus(
                this.currentProject!.id,
                createdIssue.id,
                statusFieldId,
                columnId
              );

              // Reload project data after the status is updated
              this.loadProject(this.currentProject!.id);
            } catch (err) {
              console.error("Error updating issue status:", err);
              // Reload anyway to get the new issue
              this.loadProject(this.currentProject!.id);
            }
          }, 2000);
        }
      } else {
        // Reload the project to show the new issue
        await this.loadProject(this.currentProject.id);
      }

      return createdIssue;
    } catch (error) {
      console.error("Error creating issue:", error);
      this.setError("Failed to create issue");
      return null;
    }
  }

  // Update an issue's labels
  async updateIssueLabels(issueId: string, labelIds: string[]) {
    try {
      // Find the issue
      const issue = this.issues.find((i) => i.id === issueId);
      if (!issue) return false;

      // Get current labels
      const currentLabelIds = issue.labels?.map((l) => l.id) || [];

      // Labels to add
      const labelsToAdd = labelIds.filter((id) => !currentLabelIds.includes(id));

      // Labels to remove
      const labelsToRemove = currentLabelIds.filter((id) => !labelIds.includes(id));

      // Process additions
      if (labelsToAdd.length > 0) {
        await this.labelService.addLabelsToIssue(issueId, labelsToAdd);
      }

      // Process removals
      for (const labelId of labelsToRemove) {
        await this.labelService.removeLabelFromIssue(issueId, labelId);
      }

      // Update local state with the new labels
      runInAction(() => {
        this.issues = this.issues.map((issue) => {
          if (issue.id === issueId) {
            // Find the label objects for the selected IDs
            const newLabels = labelIds
              .map((id) => this.labels.find((l) => l.id === id))
              .filter((label): label is Label => label !== undefined);

            return { ...issue, labels: newLabels };
          }
          return issue;
        });
      });

      return true;
    } catch (error) {
      console.error("Error updating issue labels:", error);
      this.setError("Failed to update labels");
      return false;
    }
  }

  // Move an issue to a different column
  async moveIssue(issueId: string, columnId: string) {
    if (!this.currentProject) return false;

    try {
      // Get the status field (needed for GitHub Projects)
      const statusFieldId = await this.columnService.getStatusFieldId(this.currentProject.id);

      if (!statusFieldId) {
        this.setError("Could not find status field");
        return false;
      }

      // Update the issue status
      await this.issueService.updateIssueStatus(
        this.currentProject.id,
        issueId,
        statusFieldId,
        columnId
      );

      // Find the column
      const column = this.columns.find((c) => c.id === columnId);

      // Update local state
      runInAction(() => {
        this.issues = this.issues.map((issue) => {
          if (issue.id === issueId) {
            return {
              ...issue,
              columnId,
              columnName: column?.name || "",
            };
          }
          return issue;
        });
      });

      return true;
    } catch (error) {
      console.error("Error moving issue:", error);
      this.setError("Failed to move issue");
      return false;
    }
  }

  // Utility methods
  setLoading(value: boolean) {
    this.loading = value;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setIssuesVisible(value: boolean) {
    this.issuesVisible = value;
  }
}

// Create a singleton instance
export const projectStore = new ProjectStore();

import { makeAutoObservable, runInAction } from "mobx";
import { Project } from "../types";
import { GitHubService } from "../services/github.service";
import {
  projectSchema,
  boardSchema,
  labelSchema,
  issueSchema,
  collaboratorSchema,
} from "../utils/validation";
import { IssueState } from "../types";

export class ProjectStore {
  projects: Project[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async createProject(name: string, description?: string) {
    try {
      this.loading = true;
      this.error = null;

      const validatedData = projectSchema.parse({ name, description });
      const project = await GitHubService.createProject(
        validatedData.name,
        validatedData.description
      );

      if (project) {
        runInAction(() => {
          this.projects.push(project);
        });
        return project;
      }
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to create project";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createBoard(projectId: string, name: string) {
    try {
      this.loading = true;
      this.error = null;

      const validatedData = boardSchema.parse({ name });
      const board = await GitHubService.createBoard(
        projectId,
        validatedData.name
      );

      if (board) {
        runInAction(() => {
          const project = this.projects.find((p) => p.id === projectId);
          if (project) {
            project.boards.push(board);
          }
        });
        return board;
      }
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to create board";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createLabel(
    projectId: string,
    name: string,
    color: string,
    description?: string
  ) {
    try {
      this.loading = true;
      this.error = null;

      const validatedData = labelSchema.parse({ name, color, description });
      const label = await GitHubService.createLabel(
        projectId,
        validatedData.name,
        validatedData.color,
        validatedData.description
      );

      if (label) {
        runInAction(() => {
          const project = this.projects.find((p) => p.id === projectId);
          if (project) {
            project.boards.forEach((board) => {
              board.labels.push(label);
            });
          }
        });
        return label;
      }
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to create label";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createIssue(
    projectId: string,
    title: string,
    description?: string,
    labels: string[] = []
  ) {
    try {
      this.loading = true;
      this.error = null;

      const validatedData = issueSchema.parse({ title, description, labels });
      const issue = await GitHubService.createIssue(
        projectId,
        validatedData.title,
        validatedData.description,
        validatedData.labels
      );

      if (issue) {
        runInAction(() => {
          const project = this.projects.find((p) => p.id === projectId);
          if (project) {
            project.boards.forEach((board) => {
              board.columns.forEach((column) => {
                if (column.name === "To Do") {
                  column.issues.push(issue);
                }
              });
            });
          }
        });
        return issue;
      }
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to create issue";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateIssueState(issueId: string, state: IssueState) {
    try {
      this.loading = true;
      this.error = null;

      const updatedIssue = await GitHubService.updateIssueState(issueId, state);

      if (updatedIssue) {
        runInAction(() => {
          this.projects.forEach((project) => {
            project.boards.forEach((board) => {
              board.columns.forEach((column) => {
                const issueIndex = column.issues.findIndex(
                  (i) => i.id === issueId
                );
                if (issueIndex !== -1) {
                  column.issues[issueIndex].state = state;
                }
              });
            });
          });
        });
        return updatedIssue;
      }
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : "Failed to update issue state";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async addCollaborator(projectId: string, userId: string, role: string) {
    try {
      this.loading = true;
      this.error = null;

      const validatedData = collaboratorSchema.parse({ userId, role });
      const updatedProject = await GitHubService.addCollaborator(
        projectId,
        validatedData.userId,
        validatedData.role
      );

      if (updatedProject) {
        runInAction(() => {
          const projectIndex = this.projects.findIndex(
            (p) => p.id === projectId
          );
          if (projectIndex !== -1) {
            this.projects[projectIndex] = updatedProject;
          }
        });
        return updatedProject;
      }
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : "Failed to add collaborator";
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export const projectStore = new ProjectStore();

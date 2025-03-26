import { makeAutoObservable, runInAction } from "mobx";
import { GitHubService } from "../services/github.service";
import { Board, BoardFormData, Collaborator, CollaboratorFormData, Project } from "../types";
import { v4 as uuidv4 } from "uuid";

export class ProjectStore {
  projects: Project[] = [];
  loading = false;
  error: string | null = null;
  selectedProject: Project | null = null;

  constructor(private gitHubService: GitHubService) {
    makeAutoObservable(this);
  }

  async fetchProjects() {
    this.loading = true;
    this.error = null;

    try {
      const projects = await this.gitHubService.getProjects();

      runInAction(() => {
        this.projects = projects.map((project) => ({
          ...project,
          id: isNaN(project.id) ? Date.now() : project.id,
          boards: [],
          collaborators: [],
        }));
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
    }
  }

  async createProject(name: string, description: string) {
    this.loading = true;
    this.error = null;

    try {
      const project = await this.gitHubService.createProject(name, description);

      runInAction(() => {
        this.projects.push({
          ...project,
          boards: [],
          collaborators: [],
        });
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
    }
  }

  async updateProject(projectId: number, name: string, description: string) {
    this.loading = true;
    this.error = null;

    try {
      const updatedProject = await this.gitHubService.updateProject(projectId, name, description);

      runInAction(() => {
        const index = this.projects.findIndex((p) => p.id === projectId);
        if (index !== -1) {
          // Preserve boards and collaborators
          const existingBoards = this.projects[index].boards || [];
          const existingCollaborators = this.projects[index].collaborators || [];

          this.projects[index] = {
            ...updatedProject,
            boards: existingBoards,
            collaborators: existingCollaborators,
          };
        }
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
    }
  }

  async deleteProject(projectId: number) {
    this.loading = true;
    this.error = null;

    try {
      await this.gitHubService.deleteProject(projectId);

      runInAction(() => {
        this.projects = this.projects.filter((project) => project.id !== projectId);
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.loading = false;
      });
    }
  }

  // Boards management
  addBoard(projectId: number, boardData: BoardFormData) {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      this.error = "Project not found";
      return;
    }

    const newBoard: Board = {
      id: uuidv4(), // Use string UUID directly
      name: boardData.name,
      type: boardData.type,
    };

    // Ensure boards array exists
    if (!project.boards) {
      project.boards = [];
    }

    project.boards.push(newBoard);
  }

  deleteBoard(projectId: number, boardId: string) {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project || !project.boards) {
      this.error = "Project or boards not found";
      return;
    }

    project.boards = project.boards.filter((board) => board.id !== boardId);
  }

  // Collaborators management
  addCollaborator(projectId: number, collaboratorData: CollaboratorFormData) {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) {
      this.error = "Project not found";
      return;
    }

    const newCollaborator: Collaborator = {
      id: uuidv4(), // Use string UUID directly
      username: collaboratorData.username,
      avatar: `https://avatars.githubusercontent.com/${collaboratorData.username}`,
      role: collaboratorData.role,
    };

    // Ensure collaborators array exists
    if (!project.collaborators) {
      project.collaborators = [];
    }

    // Check if collaborator already exists
    const existingIndex = project.collaborators.findIndex(
      (c) => c.username === collaboratorData.username
    );
    if (existingIndex !== -1) {
      // Update existing collaborator
      project.collaborators[existingIndex] = newCollaborator;
    } else {
      // Add new collaborator
      project.collaborators.push(newCollaborator);
    }
  }

  removeCollaborator(projectId: number, collaboratorId: string) {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project || !project.collaborators) {
      this.error = "Project or collaborators not found";
      return;
    }

    project.collaborators = project.collaborators.filter((collab) => collab.id !== collaboratorId);
  }

  selectProject(projectId: number) {
    this.selectedProject = this.projects.find((p) => p.id === projectId) || null;
  }

  clearSelectedProject() {
    this.selectedProject = null;
  }

  clearError() {
    this.error = null;
  }
}

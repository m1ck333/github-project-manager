import { ProjectV2SingleSelectFieldOptionColor } from "../api/generated/graphql";
import {
  GetAllInitialDataDocument,
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  LinkRepositoryToProjectDocument,
  AddColumnDocument,
  CreateIssueDocument,
  UpdateIssueStatusDocument,
  CreateLabelDocument,
  AddProjectItemDocument,
  DeleteIssueDocument,
} from "../api/operations/operation-names";
import { GithubProjectData, GithubViewerData, mapToProject } from "../core/mappers/project.mapper";
import {
  Project,
  BoardIssue,
  Column,
  ProjectFormData,
  ColumnFormData,
  ColumnType,
  Label,
} from "../core/types";

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
   * Create a new project
   */
  async createProject(projectData: ProjectFormData, ownerId: string): Promise<Project> {
    const input = {
      ownerId: ownerId,
      title: projectData.name,
      ...(projectData.description ? { description: projectData.description } : {}),
    };

    const data = await graphQLClientService.mutation(CreateProjectDocument, { input });

    // Use type assertion for response
    interface CreateProjectResponse {
      createProjectV2?: {
        projectV2?: {
          id: string;
          title: string;
          createdAt: string;
          updatedAt: string;
          url: string;
        };
      };
    }

    const typedData = data as unknown as CreateProjectResponse;

    if (!typedData?.createProjectV2?.projectV2) {
      throw new Error("Failed to create project");
    }

    // Return project from the response
    const projectResponse = typedData.createProjectV2.projectV2;

    // Create a well-formed project object
    const newProject: Project = {
      id: projectResponse.id,
      name: projectResponse.title,
      description: projectData.description || "",
      createdAt: projectResponse.createdAt,
      updatedAt: projectResponse.updatedAt,
      url: projectResponse.url,
      html_url: projectResponse.url,
      createdBy: {
        login: "", // This will be filled in by the store
        avatarUrl: "",
      },
      owner: {
        login: "", // This will be filled in by the store
        avatarUrl: "",
      },
      columns: [],
      issues: [],
      collaborators: [],
      repositories: [],
    };

    return newProject;
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId: string, projectData: ProjectFormData): Promise<Project> {
    const input = {
      projectId: projectId,
      title: projectData.name,
      ...(projectData.description ? { shortDescription: projectData.description } : {}),
    };

    const data = await graphQLClientService.mutation(UpdateProjectDocument, { input });

    // Use type assertion for response
    interface UpdateProjectResponse {
      updateProjectV2?: {
        projectV2?: {
          id: string;
          title: string;
          updatedAt: string;
          url: string;
        };
      };
    }

    const typedData = data as unknown as UpdateProjectResponse;

    if (!typedData?.updateProjectV2?.projectV2) {
      throw new Error("Failed to update project");
    }

    const projectResponse = typedData.updateProjectV2.projectV2;

    // Find the existing project to maintain its relationships
    const existingProject = this.getProjectById(projectId);
    if (!existingProject) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Create an updated project object
    const updatedProject: Project = {
      ...existingProject,
      id: projectResponse.id,
      name: projectResponse.title,
      updatedAt: projectResponse.updatedAt,
      url: projectResponse.url,
      html_url: projectResponse.url,
    };

    return updatedProject;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<boolean> {
    const input = { projectId };

    const data = await graphQLClientService.mutation(DeleteProjectDocument, { input });

    interface DeleteProjectResponse {
      deleteProjectV2?: {
        clientMutationId: string | null;
      };
    }

    const typedData = data as unknown as DeleteProjectResponse;
    return Boolean(typedData?.deleteProjectV2);
  }

  /**
   * Add a column to a project
   */
  async addColumn(
    projectId: string,
    columnData: ColumnFormData,
    statusFieldId: string
  ): Promise<Column | null> {
    // Convert column type to a color
    const color = this.getColorForColumnType(columnData.type);

    await graphQLClientService.mutation(AddColumnDocument, {
      projectId: statusFieldId,
      name: columnData.name,
      color:
        ProjectV2SingleSelectFieldOptionColor[
          color as keyof typeof ProjectV2SingleSelectFieldOptionColor
        ],
    });

    // Since our mutation doesn't return the field ID, we create a simulated column
    // In a real app, we would fetch the project fields to get the actual field ID
    const newColumn: Column = {
      id: `temp-${Date.now()}`,
      name: columnData.name,
      type: columnData.type,
      fieldId: statusFieldId,
    };

    return newColumn;
  }

  /**
   * Create an issue
   */
  async createIssue(
    repositoryId: string,
    title: string,
    body: string = ""
  ): Promise<{ issueId: string; number: number }> {
    const data = await graphQLClientService.mutation(CreateIssueDocument, {
      repositoryId,
      title,
      body,
    });

    interface CreateIssueResponse {
      createIssue?: {
        issue?: {
          id: string;
          number: number;
        };
      };
    }

    const typedData = data as unknown as CreateIssueResponse;

    if (!typedData?.createIssue?.issue) {
      throw new Error("Failed to create issue");
    }

    return {
      issueId: typedData.createIssue.issue.id,
      number: typedData.createIssue.issue.number,
    };
  }

  /**
   * Add an issue to a project
   */
  async addIssueToProject(projectId: string, issueId: string): Promise<string> {
    const input = {
      projectId,
      contentId: issueId,
    };

    const data = await graphQLClientService.mutation(AddProjectItemDocument, { input });

    interface AddProjectItemResponse {
      addProjectV2ItemById?: {
        item?: {
          id: string;
        };
      };
    }

    const typedData = data as unknown as AddProjectItemResponse;

    if (!typedData?.addProjectV2ItemById?.item) {
      throw new Error("Failed to add issue to project");
    }

    return typedData.addProjectV2ItemById.item.id;
  }

  /**
   * Update an issue's status
   */
  async updateIssueStatus(
    projectId: string,
    itemId: string,
    statusFieldId: string,
    statusOptionId: string
  ): Promise<boolean> {
    const data = await graphQLClientService.mutation(UpdateIssueStatusDocument, {
      projectId,
      itemId,
      fieldId: statusFieldId,
      valueId: statusOptionId,
    });

    interface UpdateIssueStatusResponse {
      updateProjectV2ItemFieldValue?: {
        projectV2Item?: {
          id: string;
        };
      };
    }

    const typedData = data as unknown as UpdateIssueStatusResponse;
    return Boolean(typedData?.updateProjectV2ItemFieldValue?.projectV2Item);
  }

  /**
   * Create a label for a repository
   */
  async createLabel(
    repositoryId: string,
    name: string,
    color: string,
    description?: string
  ): Promise<Label> {
    // GitHub expects hex colors without the # prefix
    const colorHex = color.startsWith("#") ? color.substring(1) : color;

    const input = {
      repositoryId,
      name,
      color: colorHex,
      description: description || "",
    };

    const data = await graphQLClientService.mutation(CreateLabelDocument, { input });

    interface CreateLabelResponse {
      createLabel?: {
        label?: {
          id: string;
          name: string;
          color: string;
          description: string | null;
        };
      };
    }

    const typedData = data as unknown as CreateLabelResponse;

    if (!typedData?.createLabel?.label) {
      throw new Error("Failed to create label");
    }

    const labelData = typedData.createLabel.label;
    return {
      id: labelData.id,
      name: labelData.name,
      color: `#${labelData.color}`,
      description: labelData.description || "",
    };
  }

  /**
   * Link a repository to a project
   */
  async linkRepositoryToProject(projectId: string, repositoryId: string): Promise<boolean> {
    const input = {
      projectId,
      repositoryId,
    };

    const data = await graphQLClientService.mutation(LinkRepositoryToProjectDocument, { input });

    interface LinkRepositoryResponse {
      linkProjectV2ToRepository?: {
        clientMutationId: string | null;
      };
    }

    const typedData = data as unknown as LinkRepositoryResponse;
    return Boolean(typedData?.linkProjectV2ToRepository);
  }

  /**
   * Delete an issue
   */
  async deleteIssue(issueId: string): Promise<boolean> {
    const data = await graphQLClientService.mutation(DeleteIssueDocument, { issueId });

    interface DeleteIssueResponse {
      deleteIssue?: {
        clientMutationId: string | null;
      };
    }

    const typedData = data as unknown as DeleteIssueResponse;
    return Boolean(typedData?.deleteIssue);
  }

  /**
   * Set projects directly
   */
  setProjects(projects: Project[]): void {
    this.projects = projects;
  }

  /**
   * Helper method to get a color for a column type
   */
  private getColorForColumnType(type: ColumnType): string {
    switch (type) {
      case ColumnType.TODO:
        return "Blue";
      case ColumnType.IN_PROGRESS:
        return "Yellow";
      case ColumnType.DONE:
        return "Green";
      case ColumnType.BACKLOG:
        return "Purple";
      default:
        return "Gray";
    }
  }
}

export const projectService = new ProjectService();

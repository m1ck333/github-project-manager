import { action } from "mobx";

import { executeGitHubMutation, executeGitHubQuery } from "@/api-github";
import {
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  GetProjectsDocument,
  ProjectV2,
} from "@/api-github/generated/graphql";
import { executeServiceOperation, ServiceResult } from "@/common/utils/service.utils";

import { mapToProject } from "../mappers";

import { BaseProjectService } from "./base-project.service";

import type { Project, ProjectFormData } from "../types";

/**
 * Service for project CRUD operations
 * Extends BaseProjectService to leverage common project functionality
 * Combines operations from ProjectOperationsService and ProjectFetchService
 */
export class ProjectCrudService extends BaseProjectService {
  /**
   * Fetch all projects with caching
   */
  @action
  async fetchProjects(forceRefresh = false): Promise<ServiceResult<Project[]>> {
    return this.executeWithCache(async () => {
      return executeServiceOperation(
        this,
        async () => {
          const { data, error } = await executeGitHubQuery(GetProjectsDocument);

          if (error || !data) {
            throw new Error(error?.message || "Failed to fetch projects data");
          }

          const projectsData = data.viewer.projectsV2.nodes;
          if (!projectsData) {
            throw new Error("No projects data found in the response");
          }

          const projects = projectsData
            .filter((project): project is NonNullable<typeof project> => project !== null)
            .map((project) => mapToProject(project as unknown as ProjectV2));

          this._items = projects;
          return projects;
        },
        {
          errorPrefix: "Failed to fetch projects",
          successMessage: "Projects successfully fetched",
        }
      );
    }, forceRefresh);
  }

  /**
   * Create a new project
   */
  @action
  async createProject(
    projectData: ProjectFormData,
    ownerId: string
  ): Promise<ServiceResult<Project>> {
    return executeServiceOperation(
      this,
      async () => {
        const input = {
          ownerId,
          title: projectData.name,
          // description is not supported in CreateProjectV2Input
        };

        const { data, error } = await executeGitHubMutation(CreateProjectDocument, { input });

        if (error || !data?.createProjectV2?.projectV2) {
          throw error || new Error("Failed to create project");
        }

        const projectResponse = data.createProjectV2.projectV2;

        // Absolute minimum - only ID and fields from schema
        const newProject = {
          id: projectResponse.id,
          name: projectResponse.title,
        } as Project;

        // Only add description if provided in our app model (not sent to GitHub API)
        if (projectData.description) {
          newProject.description = projectData.description;
        }

        this._items.push(newProject as Project);
        return newProject;
      },
      {
        errorPrefix: "Failed to create project",
        successMessage: `Project '${projectData.name}' successfully created`,
      }
    );
  }

  /**
   * Update an existing project
   */
  @action
  async updateProject(
    projectId: string,
    projectData: ProjectFormData
  ): Promise<ServiceResult<Project>> {
    return executeServiceOperation(
      this,
      async () => {
        const input = {
          projectId,
          title: projectData.name,
          ...(projectData.description ? { shortDescription: projectData.description } : {}),
        };

        const { data, error } = await executeGitHubMutation(UpdateProjectDocument, { input });

        if (error || !data?.updateProjectV2?.projectV2) {
          throw error || new Error("Failed to update project");
        }

        const existingProject = this.getById(projectId);

        if (!existingProject) {
          throw new Error(`Project with ID ${projectId} not found`);
        }

        existingProject.name = projectData.name;

        if (projectData.description !== undefined) {
          existingProject.description = projectData.description;
        }

        return existingProject;
      },
      {
        errorPrefix: "Failed to update project",
        successMessage: `Project '${projectData.name}' successfully updated`,
      }
    );
  }

  /**
   * Delete a project
   */
  @action
  async deleteProject(projectId: string): Promise<ServiceResult<boolean>> {
    return executeServiceOperation(
      this,
      async () => {
        const { data, error } = await executeGitHubMutation(DeleteProjectDocument, {
          input: { projectId },
        });

        if (error) {
          throw error;
        }

        if (data?.deleteProjectV2) {
          this._items = this._items.filter((p) => p.id !== projectId);
          return true;
        }

        return false;
      },
      {
        errorPrefix: "Failed to delete project",
        successMessage: "Project successfully deleted",
      }
    );
  }

  /**
   * Get all projects
   */
  getAll(): Project[] {
    return this._items;
  }

  /**
   * Get a project by ID
   */
  getProjectById(id: string): Project | undefined {
    return this.getById(id);
  }
}

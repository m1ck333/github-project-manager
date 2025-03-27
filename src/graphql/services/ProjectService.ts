/**
 * Project Service
 *
 * Service class to handle all project-related operations.
 * Uses the GraphQL generated hooks and handles data transformation.
 */
import { client } from "../client";
import { Project, ProjectFormData } from "../../types";
import { transformProjectV2ToProject } from "../utils";
import {
  GetViewerDocument,
  GetProjectDocument,
  GetProjectsDocument,
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  ProjectFieldsFragmentDoc,
} from "../generated/graphql";
import { getFragmentData } from "../generated/fragment-masking";

/**
 * Service for managing GitHub projects
 */
export class ProjectService {
  private client = client;

  /**
   * Get a project by its ID
   */
  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await this.client.query(GetProjectDocument, { id }).toPromise();

    if (error || !data?.node) {
      console.error("Error fetching project:", error);
      return null;
    }

    // Check that the node is a ProjectV2
    if (data.node && data.node.__typename === "ProjectV2") {
      const projectData = getFragmentData(ProjectFieldsFragmentDoc, data.node);
      return transformProjectV2ToProject(projectData);
    }

    return null;
  }

  /**
   * Get all projects for the current user
   */
  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.client.query(GetProjectsDocument, {}).toPromise();

    if (error || !data?.viewer?.projectsV2?.nodes) {
      console.error("Error fetching projects:", error);
      return [];
    }

    // Filter out null nodes and transform to our Project type
    return data.viewer.projectsV2.nodes
      .filter((node) => node !== null)
      .map((projectV2) => {
        const projectData = getFragmentData(ProjectFieldsFragmentDoc, projectV2);
        return transformProjectV2ToProject(projectData);
      });
  }

  /**
   * Create a new project
   */
  async createProject(projectData: ProjectFormData): Promise<Project | null> {
    // Get the current user ID
    const { data: viewerData } = await this.client.query(GetViewerDocument, {}).toPromise();

    if (!viewerData?.viewer?.id) {
      console.error("Error: Could not get viewer ID");
      return null;
    }

    const input = {
      ownerId: viewerData.viewer.id,
      title: projectData.name,
      ...(projectData.description ? { description: projectData.description } : {}),
    };

    const { data, error } = await this.client
      .mutation(CreateProjectDocument, { input })
      .toPromise();

    if (error || !data?.createProjectV2?.projectV2) {
      console.error("Error creating project:", error);
      return null;
    }

    const createdProject = getFragmentData(
      ProjectFieldsFragmentDoc,
      data.createProjectV2.projectV2
    );
    return transformProjectV2ToProject(createdProject);
  }

  /**
   * Update a project
   */
  async updateProject(id: string, projectData: ProjectFormData): Promise<Project | null> {
    const input = {
      projectId: id,
      title: projectData.name,
      description: projectData.description,
    };

    const { data, error } = await this.client
      .mutation(UpdateProjectDocument, { input })
      .toPromise();

    if (error || !data?.updateProjectV2?.projectV2) {
      console.error("Error updating project:", error);
      return null;
    }

    const updatedProject = getFragmentData(
      ProjectFieldsFragmentDoc,
      data.updateProjectV2.projectV2
    );
    return transformProjectV2ToProject(updatedProject);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<boolean> {
    const input = {
      projectId: id,
    };

    const { data, error } = await this.client
      .mutation(DeleteProjectDocument, { input })
      .toPromise();

    if (error) {
      console.error("Error deleting project:", error);
      return false;
    }

    return !!data?.deleteProjectV2?.projectV2;
  }
}

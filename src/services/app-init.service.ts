import { client } from "../api/client";
import { GetAllInitialDataDocument } from "../api/operations/operation-names";
import { GithubRepositoryData, mapToRepository } from "../core/mappers/repository.mapper";
import { mapToUserProfile } from "../core/mappers/user.mapper";
import { AllAppData, UserProfile, Project, BoardIssue, Column } from "../core/types";
import { Projects } from "../features/projects";
import {
  GithubProjectData,
  GithubViewerData,
  mapToProject,
} from "../features/projects/lib/mappers";

import { repositoryService } from "./repository.service";
import { userService } from "./user.service";

/**
 * Service responsible for orchestrating the initialization of all application data
 * This service delegates to the individual services for user, repository, and project data
 */
export class AppInitializationService {
  private isInitializing = false;
  private initializeCount = 0;
  private lastInitialization: number = 0;
  private cacheExpiryMs: number = 5 * 60 * 1000; // 5 minute cache

  /**
   * Initialize all application data in a coordinated manner
   */
  async initialize(): Promise<AllAppData> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      // Wait for the existing initialization to complete
      await this.waitForInitialization();

      // Get data from the individual services
      return this.getCurrentData();
    }

    // Check if cache is still valid (within 5 minutes of last fetch)
    const now = Date.now();
    if (this.lastInitialization > 0 && now - this.lastInitialization < this.cacheExpiryMs) {
      // Use cached data if available and not expired
      const currentData = this.getCurrentData();
      if (currentData.user && currentData.repositories.length > 0) {
        return currentData;
      }
    }

    try {
      this.isInitializing = true;
      this.initializeCount++;

      // Make a single GraphQL query to fetch ALL data at once
      // This will also verify the token as a side effect since the query will fail with an invalid token
      const { data, error } = await client.query(GetAllInitialDataDocument, {}).toPromise();

      if (error || !data) {
        throw new Error(error?.message || "Failed to fetch initial data");
      }

      // Extract data from the viewer object which contains everything
      const viewer = data.viewer;
      if (viewer) {
        // Set user profile using mapToUserProfile from userMapper
        const userProfile = mapToUserProfile(viewer as GithubViewerData);
        userService.setUserProfile(userProfile);

        // Set repositories using mapToRepository from repositoryMapper
        if (viewer.repositories?.nodes) {
          const repositories = viewer.repositories.nodes
            .filter((node) => node !== null)
            .map((node) => mapToRepository(node as unknown as GithubRepositoryData));
          repositoryService.setRepositories(repositories);
        }

        // Set projects using mapToProject from projectMapper
        if (viewer.projectsV2?.nodes) {
          const projects = viewer.projectsV2.nodes
            .filter((node) => node !== null)
            .map((node) =>
              mapToProject(node as unknown as GithubProjectData, viewer as GithubViewerData)
            );
          Projects.services.crud.setProjects(projects);
        }
      }

      // Update last initialization timestamp
      this.lastInitialization = Date.now();

      // Return all the data
      return this.getCurrentData();
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Get current data from all services without making network requests
   */
  getCurrentData(): AllAppData {
    return {
      user: userService.getUserProfile() || {
        login: "",
        name: null,
        avatarUrl: "",
        bio: null,
        location: null,
        company: null,
        email: null,
        websiteUrl: null,
        twitterUsername: null,
      },
      repositories: repositoryService.getRepositories(),
      projects: Projects.services.crud.getProjects(),
    };
  }

  /**
   * Get all initial data from API
   */
  async getAllInitialData(): Promise<AllAppData> {
    return this.initialize();
  }

  /**
   * Get repositories from repository service
   */
  getRepositories() {
    return repositoryService.getRepositories();
  }

  /**
   * Get current user ID
   */
  getUserId(): string {
    const userProfile = userService.getUserProfile();
    if (!userProfile) return "";

    // Assuming login can be used as ID if no specific ID field exists
    return userProfile.login;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    return userService.getUserProfile();
  }

  /**
   * Get columns for a specific project
   */
  getProjectColumns(projectId: string): Column[] {
    // Get the project first to ensure we have access to columns
    const project = this.getProjectById(projectId);
    return project?.columns || [];
  }

  /**
   * Get issues for a specific project
   */
  getProjectIssues(projectId: string): BoardIssue[] {
    // Get the project first to ensure we have access to issues
    const project = this.getProjectById(projectId);
    return project?.issues || [];
  }

  /**
   * Get project by ID
   */
  getProjectById(projectId: string): Project | undefined {
    return Projects.services.crud.getProjectById(projectId);
  }

  /**
   * Get labels for a specific project
   */
  getProjectLabels(projectId: string) {
    // Get the project first to ensure we have access to labels
    const project = this.getProjectById(projectId);
    return project?.labels || [];
  }

  /**
   * Wait for any ongoing initialization to complete
   */
  private async waitForInitialization(): Promise<void> {
    return new Promise<void>((resolve) => {
      const checkInitialization = () => {
        if (!this.isInitializing) {
          resolve();
        } else {
          setTimeout(checkInitialization, 100);
        }
      };

      checkInitialization();
    });
  }
}

export const appInitializationService = new AppInitializationService();

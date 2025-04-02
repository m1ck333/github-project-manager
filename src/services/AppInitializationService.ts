import { client } from "../api/client";
import { GetAllInitialDataDocument } from "../api/operations/operation-names";
import { Project, BoardIssue, Column, Repository } from "../types";
import { AllAppData, UserProfile } from "../types/app-initialization";

import { projectService } from "./ProjectService";
import { repositoryService } from "./RepositoryService";
import { userService } from "./UserService";

// GraphQL response interfaces
interface GithubRepositoryData {
  id: string;
  name: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  description?: string | null;
  url: string;
  createdAt: string;
  collaborators?: {
    edges?: Array<{
      node: {
        id: string;
        login: string;
        avatarUrl: string;
      };
      permission?: string;
    } | null> | null;
  } | null;
}

interface GithubProjectData {
  id: string;
  title: string;
  shortDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

interface GithubViewerData {
  login: string;
  avatarUrl: string;
}

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

      // Verify token is valid first
      const isTokenValid = await userService.verifyToken();
      if (!isTokenValid) {
        throw new Error("GitHub token is invalid or missing");
      }

      // Make a single GraphQL query to fetch ALL data at once
      const { data, error } = await client.query(GetAllInitialDataDocument, {}).toPromise();

      if (error || !data) {
        throw new Error(error?.message || "Failed to fetch initial data");
      }

      // Extract data from the viewer object which contains everything
      const viewer = data.viewer;
      if (viewer) {
        // Set user profile
        const userProfile: UserProfile = {
          login: viewer.login,
          name: viewer.name || null,
          avatarUrl: viewer.avatarUrl,
          bio: viewer.bio || null,
          location: viewer.location || null,
          company: viewer.company || null,
          email: viewer.email || null,
          websiteUrl: viewer.websiteUrl || null,
          twitterUsername: viewer.twitterUsername || null,
        };
        userService.setUserProfile(userProfile);

        // Set repositories - filter out null values and transform to Repository type
        if (viewer.repositories?.nodes) {
          const repositories = viewer.repositories.nodes
            .filter((node) => node !== null)
            .map((node) => this.transformToRepository(node));
          repositoryService.setRepositories(repositories);
        }

        // Set projects - filter out null values and transform to Project type
        if (viewer.projectsV2?.nodes) {
          const projects = viewer.projectsV2.nodes
            .filter((node) => node !== null)
            .map((node) => this.transformToProject(node, viewer));
          projectService.setProjects(projects);
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
   * Helper method to transform GitHub repository data to our Repository type
   */
  private transformToRepository(repoData: GithubRepositoryData): Repository {
    return {
      id: repoData.id,
      name: repoData.name,
      owner: {
        login: repoData.owner.login,
        avatar_url: repoData.owner.avatarUrl,
      },
      description: repoData.description || "",
      html_url: repoData.url,
      createdAt: repoData.createdAt,
      collaborators:
        repoData.collaborators?.edges?.filter(Boolean).map((edge) => ({
          id: edge!.node.id,
          login: edge!.node.login,
          avatarUrl: edge!.node.avatarUrl,
          permission: edge!.permission || "READ",
        })) || [],
    };
  }

  /**
   * Helper method to transform GitHub project data to our Project type
   */
  private transformToProject(projectData: GithubProjectData, viewer: GithubViewerData): Project {
    // Basic project data
    return {
      id: projectData.id,
      name: projectData.title,
      description: projectData.shortDescription || "",
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
      url: projectData.url,
      html_url: projectData.url,
      createdBy: {
        login: viewer.login,
        avatarUrl: viewer.avatarUrl,
      },
      owner: {
        login: viewer.login,
        avatar_url: viewer.avatarUrl,
      },
      columns: [],
      issues: [],
      repositories: [],
      collaborators: [],
    };
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
      projects: projectService.getProjects(),
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
   * Get project columns by project ID
   */
  getProjectColumns(projectId: string): Column[] {
    const project = this.getProjectById(projectId);
    return project?.columns || [];
  }

  /**
   * Get project issues by project ID
   */
  getProjectIssues(projectId: string): BoardIssue[] {
    const project = this.getProjectById(projectId);
    return project?.issues || [];
  }

  /**
   * Get project by ID
   */
  getProjectById(projectId: string): Project | undefined {
    return projectService.getProjectById(projectId);
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

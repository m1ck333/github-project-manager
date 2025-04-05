import { CombinedError } from "@urql/core";
import { makeAutoObservable } from "mobx";

import { executeGitHubQuery, GitHubResponse } from "@/api-github";
import { GetAllInitialDataDocument } from "@/api-github/generated/graphql";
import { getCurrentISOString } from "@/common/utils/date.utils";
import { Projects } from "@/features/projects";
import { mapToProject } from "@/features/projects/mappers";
import { Project, BoardIssue, Column } from "@/features/projects/types";
import { Repositories } from "@/features/repositories";
import { mapToRepository } from "@/features/repositories/mappers";
import { Repository } from "@/features/repositories/types/repository";
import { RepositoryApiModel } from "@/features/repositories/types/repository-api.types";
import { mapToUserProfile } from "@/features/user/mappers";
import { userService } from "@/features/user/services";
import { userStore } from "@/features/user/stores";
import { UserProfile } from "@/features/user/types";

import { GitHubViewerData, GitHubProjectNode } from "../types/app.types";

/**
 * Combined application data type
 */
export interface AllAppData {
  user: UserProfile;
  repositories: Repository[];
  projects: Project[];
}

/**
 * Query response type
 */
interface QueryResponse {
  data?: unknown;
  error?: Error;
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
  private rateLimitedRetryCount = 0;
  private maxRetries = 5;

  private _isInitialized = false;
  private _isLoading = false;
  private _error: Error | null = null;
  private _data: Partial<AllAppData> = {};

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Check if the app is already initialized
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Loading state for initialization
   */
  get isLoading(): boolean {
    return this._isLoading || this.isInitializing;
  }

  /**
   * Any error that occurred during initialization
   */
  get error(): Error | null {
    return this._error;
  }

  /**
   * All the application data loaded during initialization
   */
  get data(): Partial<AllAppData> {
    return this._data;
  }

  /**
   * Initialize all application data in a coordinated manner
   */
  async initialize(forceRefresh = false): Promise<AllAppData> {
    // If already initialized and not forcing refresh, return cached data
    if (this._isInitialized && !forceRefresh) {
      return this._data as AllAppData;
    }

    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      // Wait for the existing initialization to complete
      await this.waitForInitialization();

      // Get data from the individual services
      return this.getCurrentData();
    }

    // Check if cache is still valid (within 5 minutes of last fetch)
    const now = Date.now();
    if (
      this.lastInitialization > 0 &&
      now - this.lastInitialization < this.cacheExpiryMs &&
      !forceRefresh
    ) {
      // Use cached data if available and not expired
      const currentData = this.getCurrentData();
      if (currentData.user && currentData.repositories.length > 0) {
        return currentData;
      }
    }

    // Set loading state
    this._isLoading = true;
    this._error = null;

    try {
      this.isInitializing = true;
      this.initializeCount++;

      // Make a single GraphQL query to fetch ALL data at once
      // This will also verify the token as a side effect since the query will fail with an invalid token
      const response = await this.queryWithRetry();
      const { data, error } = response;

      if (error || !data) {
        throw new Error(error?.message || "Failed to fetch initial data");
      }

      // Extract data from the viewer object which contains everything
      // Using type assertion as we know the structure from the GraphQL schema
      const viewerData = data as { viewer: GitHubViewerData };
      if (viewerData.viewer) {
        // Set user profile using mapToUserProfile from userMapper
        const userProfile = mapToUserProfile(viewerData.viewer);
        userStore.setProfile(userProfile);

        // Set repositories
        if (viewerData.viewer.repositories?.nodes) {
          const repositories = viewerData.viewer.repositories.nodes
            .filter((node: unknown) => node !== null)
            .map((node: unknown) => {
              // Map the repository using the repository mapper
              return mapToRepository(node as Partial<RepositoryApiModel>);
            });

          // Update the repository store in the feature
          if (Repositories && Repositories.store) {
            // Need to ensure all repositories have createdAt as non-optional field
            const reposWithRequiredFields = repositories.map((repo: Repository) => ({
              ...repo,
              createdAt: repo.createdAt || getCurrentISOString(),
            }));
            Repositories.store.setRepositories(reposWithRequiredFields);
          }
        }

        // Set projects
        if (viewerData.viewer.projectsV2?.nodes) {
          const projects = viewerData.viewer.projectsV2.nodes
            .filter((node: unknown) => node !== null)
            .map((node: unknown) => {
              // Use type assertion for the node and viewer
              return mapToProject(node as GitHubProjectNode, viewerData.viewer);
            });

          // Update the project store in the features
          Projects.services.crud.setProjects(projects);

          // Also update the root project store directly
          if (Projects.store) {
            Projects.store.crud.setProjects(projects);
          }
        }
      }

      // Update last initialization timestamp
      this.lastInitialization = Date.now();

      // Update internal data
      this._data = this.getCurrentData();
      this._isInitialized = true;

      // Return all the data
      return this.getCurrentData();
    } catch (error) {
      // Handle errors
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this._error = errorObj;
      throw errorObj;
    } finally {
      this.isInitializing = false;
      this._isLoading = false;
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
      // Cast the repositories to ensure compatibility with AllAppData type
      // This is necessary because of differences between repository types in core and features
      repositories: Repositories.store
        .repositories as unknown as import("@/features/repositories/types").Repository[],
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
  getRepositories(): Repository[] {
    return Repositories.store.repositories;
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
   * Reset the initialization state
   * Useful when logging out or when needing to reinitialize the app
   */
  reset(): void {
    this._isInitialized = false;
    this._isLoading = false;
    this._error = null;
    this._data = {};
    this.isInitializing = false;
    this.lastInitialization = 0;
  }

  /**
   * Set the user profile directly
   * This is useful when we have the profile from another source
   */
  setUserProfile(profile: UserProfile): void {
    userStore.setProfile(profile);

    this._data.user = profile;

    // If this is the first time setting the user, mark as initialized
    if (!this._isInitialized) {
      this._isInitialized = true;
    }
  }

  /**
   * Query GraphQL with retry logic for rate limiting
   */
  private async queryWithRetry(): Promise<QueryResponse> {
    let retryCount = 0;

    while (retryCount <= this.maxRetries) {
      try {
        const response: GitHubResponse = await executeGitHubQuery(GetAllInitialDataDocument);

        if (response.error) {
          // Check for rate limiting errors
          if (
            response.error instanceof CombinedError &&
            response.error.message.includes("rate limit")
          ) {
            // Increment rate limited retry count for exponential backoff
            this.rateLimitedRetryCount++;
            retryCount++;

            // Wait with exponential backoff
            await this.waitBetweenRetries(this.rateLimitedRetryCount);
            continue;
          }

          throw response.error;
        }

        // Reset rate limited count on success
        this.rateLimitedRetryCount = 0;

        return { data: response.data };
      } catch (error) {
        retryCount++;

        if (retryCount > this.maxRetries) {
          return { error: error instanceof Error ? error : new Error(String(error)) };
        }

        // Wait before retrying
        await this.waitBetweenRetries(retryCount);
      }
    }

    return { error: new Error("Max retries reached") };
  }

  /**
   * Wait between retries with exponential backoff
   */
  private waitBetweenRetries(retryCount: number): Promise<void> {
    // Use exponential backoff: 2^retry * 1000ms
    const delayMs = Math.pow(2, retryCount) * 1000;
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Wait for initialization to complete if another init is in progress
   */
  private async waitForInitialization(): Promise<void> {
    const startWaitTime = Date.now();
    const maxWaitTime = 30000; // Maximum wait time of 30 seconds

    while (this.isInitializing) {
      // Check if we've waited too long
      if (Date.now() - startWaitTime > maxWaitTime) {
        throw new Error("Timed out waiting for initialization to complete");
      }

      // Wait a bit and check again
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

export const appInitService = new AppInitializationService();

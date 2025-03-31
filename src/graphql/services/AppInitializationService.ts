import {
  AllAppData,
  BoardIssue,
  Column,
  ColumnType,
  Label,
  Project,
  Repository,
  RepositoryCollaborator,
  UserProfile,
} from "../../types";
import { client } from "../client";
import { GetAllInitialDataDocument } from "../generated/graphql";

// Define interfaces for GitHub data types
interface GitHubIssue {
  __typename?: "Issue";
  id: string;
  title: string;
  number: number;
  body?: string;
  state: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  repository?: {
    id: string;
    name: string;
  };
  author?: {
    login: string;
    url: string;
    avatarUrl: string;
  };
  labels?: {
    nodes?: Array<{
      id: string;
      name: string;
      color: string;
      description?: string;
    } | null>;
  };
}

interface GitHubFieldNode {
  __typename?: string;
  id: string;
  name: string;
  dataType: string;
  options?: Array<{
    id: string;
    name: string;
  } | null> | null;
}

interface GitHubProjectItemNode {
  id: string;
  content?: GitHubIssue | null;
  fieldValues?: {
    nodes?: Array<GitHubFieldValue | null> | null;
  };
}

type GitHubFieldValue =
  | {
      __typename: "ProjectV2ItemFieldSingleSelectValue";
      field?: { id: string; name: string };
      optionId?: string;
      name?: string;
    }
  | {
      __typename: string;
      field?: { id: string; name: string };
      [key: string]: unknown;
    };

// Define interfaces for the project item and its fields
interface ProjectItem {
  id: string;
  content?: {
    id: string;
    title: string;
    number: number;
    body?: string;
    state?: string;
    url?: string;
    createdAt?: string;
    updatedAt?: string;
    author?: {
      login: string;
      avatarUrl: string;
    };
    labels?: {
      nodes?: Array<{
        id: string;
        name: string;
        color: string;
        description?: string;
      } | null>;
    };
  };
  fieldValues?: {
    nodes?: Array<{
      name?: string;
      optionId?: string;
      field?: {
        id?: string;
        name?: string;
      };
      [key: string]: unknown;
    } | null>;
  };
}

class AppInitializationService {
  private initializedData: AllAppData | null = null;
  private isInitializing = false;
  private initializeCount = 0;

  /**
   * Fetches all application data in a single query
   * This includes user profile, repositories, projects, and all related data
   */
  async getAllInitialData(): Promise<AllAppData> {
    // Prevent multiple simultaneous initialization
    if (this.isInitializing) {
      // Wait for existing initialization to complete
      await new Promise((resolve) => {
        const checkInit = () => {
          if (!this.isInitializing) {
            resolve(true);
          } else {
            setTimeout(checkInit, 100);
          }
        };
        checkInit();
      });
      // Return the data that was loaded by the other initialization
      return this.initializedData!;
    }

    // If already initialized, return cached data
    if (this.initializedData !== null) {
      return this.initializedData;
    }

    try {
      this.isInitializing = true;
      this.initializeCount++;

      const { data, error } = await client.query(GetAllInitialDataDocument, {}).toPromise();

      if (error) {
        throw new Error(`Error fetching app data: ${error.message}`);
      }

      if (!data || !data.viewer) {
        throw new Error("Failed to fetch application data");
      }

      // Direct mapping without the transformation utility
      const { viewer } = data;

      // Transform user profile
      const user: UserProfile = {
        login: viewer.login,
        name: viewer.name || null,
        avatarUrl: viewer.avatarUrl,
        bio: viewer.bio || null,
        location: viewer.location || null,
        company: viewer.company || null,
        email: viewer.email,
        websiteUrl: viewer.websiteUrl,
        twitterUsername: viewer.twitterUsername || null,
      };

      // Transform repositories with direct mapping
      const repositories: Repository[] = (viewer.repositories?.nodes || [])
        .filter(Boolean)
        .map((repo) => {
          if (!repo) return null;

          // Transform repository collaborators
          const collaborators: RepositoryCollaborator[] = (repo.collaborators?.edges || [])
            .filter(Boolean)
            .map((edge) => {
              if (!edge || !edge.node) return null;
              return {
                id: edge.node.id,
                login: edge.node.login,
                avatarUrl: edge.node.avatarUrl,
                permission: edge.permission || "READ",
                isCurrentUser: edge.node.login === viewer.login,
              };
            })
            .filter(Boolean) as RepositoryCollaborator[];

          // Transform repository labels
          const labels: Label[] = (repo.labels?.nodes || [])
            .filter(Boolean)
            .map((label) => {
              if (!label) return null;
              return {
                id: label.id,
                name: label.name,
                color: label.color,
                description: label.description || undefined,
              };
            })
            .filter(Boolean) as Label[];

          return {
            id: repo.id,
            name: repo.name,
            owner: {
              login: repo.owner.login,
              avatar_url: repo.owner.avatarUrl,
            },
            description: repo.description || undefined,
            html_url: repo.url,
            createdAt: repo.createdAt,
            collaborators,
          };
        })
        .filter(Boolean) as Repository[];

      // Transform projects - refactored to properly identify status fields
      const projects: Project[] = (viewer.projectsV2?.nodes || [])
        .filter(Boolean)
        .map((project) => {
          if (!project) return null;

          // Define an interface for single select field structure
          interface SingleSelectFieldWithOptions {
            id: string;
            name: string;
            options: Array<{
              id: string;
              name: string;
              color?: string;
            }>;
          }

          // Examine all fields to find SingleSelectField that can be used for columns
          const safeFields: SingleSelectFieldWithOptions[] = [];

          // Look for fields with options, focusing on SINGLE_SELECT type
          (project.fields?.nodes || []).forEach((field) => {
            if (field?.dataType === "SINGLE_SELECT" && field.name && field.id) {
              if ("options" in field && Array.isArray(field.options) && field.options.length > 0) {
                safeFields.push({
                  id: field.id,
                  name: field.name,
                  options: field.options,
                });
              }
            }
          });

          // Create columns from all fields, prioritizing Status if found
          const columns: Column[] = [];
          let statusField: SingleSelectFieldWithOptions | null = null;

          // First look for a field named "Status"
          statusField = safeFields.find((field) => field.name === "Status") || null;

          // If no Status field found, use the first single select field
          if (!statusField && safeFields.length > 0) {
            statusField = safeFields[0];
          }

          // Process status field to create columns
          if (statusField) {
            statusField.options.forEach((option) => {
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

              // Add the column
              columns.push({
                id: option.id,
                name: option.name,
                type: columnType,
                fieldId: statusField?.id,
                fieldName: statusField?.name,
              });
            });
          }

          // Add No Status column first
          columns.unshift({
            id: "no-status",
            name: "No Status",
            type: ColumnType.TODO,
          });

          // Create a map of option IDs to column IDs for easy lookup
          const optionIdToColumnId = new Map<string, string>();
          columns.forEach((column) => {
            optionIdToColumnId.set(column.id, column.id);
          });

          // Process items to issues
          const projectItems = project.items?.nodes || [];
          const issues = this.createBoardIssuesFromProjectItems(projectItems, columns);

          // Get project repositories
          const projectRepositories: Repository[] = [];
          project.repositories?.nodes?.forEach((repo) => {
            if (!repo) return;

            // Look for full repository info first
            const fullRepo = repositories.find((r) => r.id === repo.id);
            if (fullRepo) {
              projectRepositories.push(fullRepo);
            } else {
              // Create minimal representation
              projectRepositories.push({
                id: repo.id,
                name: repo.name,
                owner: {
                  login: repo.owner.login,
                  avatar_url: repo.owner.avatarUrl,
                },
                html_url: repo.url,
              });
            }
          });

          // Create the final Project object
          const finalProject = {
            id: project.id,
            name: project.title,
            description: project.shortDescription || undefined,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            url: project.url,
            html_url: project.url,
            owner: {
              login: viewer.login,
              avatar_url: viewer.avatarUrl,
            },
            createdBy: {
              login: viewer.login,
              avatarUrl: viewer.avatarUrl,
            },
            columns,
            issues,
            repositories: projectRepositories,
          };

          return finalProject;
        })
        .filter(Boolean) as Project[];

      // Store the data for later access
      this.initializedData = {
        user,
        repositories,
        projects,
      };

      return {
        user,
        repositories,
        projects,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error during data fetching";
      console.error("App initialization error:", error);
      throw new Error(errorMessage);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Gets all initialized projects
   */
  public getProjects(): Project[] {
    return this.initializedData?.projects || [];
  }

  /**
   * Gets a specific project by ID
   */
  public getProjectById(projectId: string): Project | undefined {
    return this.initializedData?.projects.find((project) => project.id === projectId);
  }

  /**
   * Gets columns for a specific project
   */
  public getProjectColumns(projectId: string): Column[] {
    const project = this.getProjectById(projectId);
    return project?.columns || [];
  }

  /**
   * Gets issues for a specific project
   */
  public getProjectIssues(projectId: string): BoardIssue[] {
    const project = this.getProjectById(projectId);
    return project?.issues || [];
  }

  /**
   * Gets repositories in the initialized data
   */
  public getRepositories(): Repository[] {
    return this.initializedData?.repositories || [];
  }

  /**
   * Gets a specific repository by ID
   */
  public getRepositoryById(repositoryId: string): Repository | undefined {
    return this.initializedData?.repositories.find((repo) => repo.id === repositoryId);
  }

  /**
   * Gets the user profile
   */
  public getUserProfile(): UserProfile | null {
    return this.initializedData?.user || null;
  }

  /**
   * Checks if the app data has been initialized
   */
  public isInitialized(): boolean {
    return this.initializedData !== null;
  }

  // Helper to check if content is a GitHub issue
  private isGitHubIssue(content: unknown): content is GitHubIssue {
    return (
      typeof content === "object" &&
      content !== null &&
      "title" in content &&
      typeof content.title === "string" &&
      "number" in content &&
      typeof content.number === "number" &&
      "__typename" in content &&
      content.__typename === "Issue" &&
      "id" in content &&
      typeof content.id === "string"
    );
  }

  // Helper to process field options into columns
  private processFieldOptions(field: GitHubFieldNode, columns: Column[]): number {
    let added = 0;

    if (field.options) {
      // First check if we already have columns with the same IDs
      const existingColumnIds = new Set(columns.map((col) => col.id));

      for (const option of field.options) {
        if (option && !existingColumnIds.has(option.id)) {
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
            fieldId: field.id,
          });

          // Add ID to the set to prevent duplicates
          existingColumnIds.add(option.id);
          added++;
        }
      }
    }

    return added;
  }

  // Helper to process an issue from an item's content
  private processIssueFromContent(
    content: GitHubIssue,
    item: GitHubProjectItemNode,
    statusFieldId?: string,
    columns?: Column[]
  ): BoardIssue | null {
    try {
      // Find status field value
      let statusOption: string | null = null;

      // Process field values to extract status and other information
      if (item.fieldValues?.nodes) {
        for (const fieldValue of item.fieldValues.nodes) {
          if (!fieldValue) continue;

          // Check if this is the status field and has optionId property
          if (
            fieldValue.field?.id === statusFieldId &&
            fieldValue.__typename === "ProjectV2ItemFieldSingleSelectValue" &&
            "optionId" in fieldValue &&
            fieldValue.optionId &&
            typeof fieldValue.optionId === "string"
          ) {
            statusOption = fieldValue.optionId;
            break;
          }
        }
      }

      // Find matching column
      let columnId = "no-status";
      let columnName = "No Status";

      if (statusOption && columns) {
        const matchingColumn = columns.find((column) => column.id === statusOption);
        if (matchingColumn) {
          columnId = matchingColumn.id;
          columnName = matchingColumn.name;
        }
      }

      // Process labels
      const labels: Label[] = [];
      if (content.labels?.nodes) {
        for (const label of content.labels.nodes) {
          if (label) {
            labels.push({
              id: label.id,
              name: label.name,
              color: label.color,
              description: label.description || "",
            });
          }
        }
      }

      // Create BoardIssue object
      const issue: BoardIssue = {
        id: item.id,
        issueId: content.id,
        number: content.number,
        title: content.title,
        body: content.body || "",
        columnId,
        columnName,
        labels: labels || [],
        url: content.url,
        author: content.author
          ? {
              login: content.author.login,
              avatarUrl: content.author.avatarUrl,
            }
          : null,
      };

      return issue;
    } catch (error) {
      return null;
    }
  }

  // Update the method signature with proper types
  private createBoardIssuesFromProjectItems(
    projectItems: ProjectItem[],
    columns: Column[]
  ): BoardIssue[] {
    console.log(`Processing ${projectItems.length} project items`);
    const issues: BoardIssue[] = [];

    for (const item of projectItems) {
      if (!item || !item.content) {
        console.log("Skipping item - no content");
        continue;
      }

      // Check if content seems like an issue
      const content = item.content;
      if (!content.id || !content.title || !content.number) {
        console.log("Item content doesn't look like an issue:", content);
        continue;
      }

      // Log that we're processing this item
      console.log(`Processing issue: "${content.title}" (#${content.number})`);

      // Create the base issue object
      const issue: BoardIssue = {
        id: item.id,
        issueId: content.id,
        number: content.number,
        title: content.title,
        body: content.body || "",
        columnId: "no-status", // Default
        statusId: "",
        columnName: "No Status", // Default
        createdAt: content.createdAt || new Date().toISOString(),
        updatedAt: content.updatedAt || new Date().toISOString(),
        url: content.url || "",
        state: content.state || "OPEN",
        projectItemId: item.id,
        labels: [],
        author: null, // Initialize with null
      };

      // Process field values to find the column
      if (item.fieldValues && item.fieldValues.nodes) {
        for (const fieldValue of item.fieldValues.nodes) {
          if (!fieldValue) continue;

          // Check if this looks like a Status field with an optionId
          if (
            fieldValue.name &&
            fieldValue.optionId &&
            fieldValue.field &&
            fieldValue.field.name === "Status"
          ) {
            const statusOptionId = fieldValue.optionId;
            console.log(`Found Status: ${fieldValue.name} (${statusOptionId})`);

            // Find the matching column
            const column = columns.find((c) => c.id === statusOptionId);
            if (column) {
              issue.columnId = column.id;
              issue.statusId = statusOptionId;
              issue.columnName = column.name;
              console.log(`Assigned to column: ${column.name}`);
            }
            break;
          }
        }
      }

      // Add author if available
      if (content.author) {
        issue.author = {
          login: content.author.login,
          avatarUrl: content.author.avatarUrl,
        };
      }

      // Add labels if available
      if (content.labels && content.labels.nodes) {
        issue.labels = content.labels.nodes.filter(Boolean).map((label) => ({
          id: label!.id,
          name: label!.name,
          color: label!.color,
          description: label!.description || "",
        }));
      }

      // Add the issue to our array
      issues.push(issue);
      console.log(`Added issue: ${content.title}`);
    }

    console.log(`Total issues processed: ${issues.length}`);
    return issues;
  }
}

export const appInitializationService = new AppInitializationService();

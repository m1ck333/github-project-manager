import { Project, Column, ColumnType, BoardIssue } from "../../../types";

// GraphQL response interfaces
export interface GithubProjectData {
  id: string;
  title: string;
  shortDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
  fields?: {
    nodes?: Array<{
      id: string;
      name: string;
      dataType: string;
      options?: Array<{
        id: string;
        name: string;
        color?: string;
      }> | null;
    } | null> | null;
  } | null;
  items?: {
    nodes?: Array<{
      id: string;
      fieldValues?: {
        nodes?: Array<{
          __typename?: string;
          name?: string;
          optionId?: string;
          field?: {
            id?: string;
            name?: string;
          } | null;
        } | null> | null;
      } | null;
      content?: {
        __typename: string;
        id: string;
        title: string;
        number: number;
        body?: string | null;
        state?: string | null;
        url: string;
        createdAt: string;
        updatedAt: string;
        author?: {
          login: string;
          avatarUrl: string;
        } | null;
        labels?: {
          nodes?: Array<{
            id: string;
            name: string;
            color: string;
            description?: string | null;
          } | null> | null;
        } | null;
        assignees?: {
          nodes?: Array<{
            id: string;
            login: string;
            avatarUrl: string;
          } | null> | null;
        } | null;
      } | null;
    } | null> | null;
  } | null;
}

export interface GithubViewerData {
  login: string;
  avatarUrl: string;
}

/**
 * Maps GitHub project data to our application Project model
 */
export function mapToProject(projectData: GithubProjectData, viewer: GithubViewerData): Project {
  const columns = mapProjectColumns(projectData.fields);
  const issues = mapProjectIssues(projectData.items, columns);

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
    columns,
    issues,
    repositories: [],
    collaborators: [],
  };
}

/**
 * Maps GitHub project field data to our application Column model
 */
export function mapProjectColumns(fieldsData?: GithubProjectData["fields"]): Column[] {
  const columns: Column[] = [
    {
      id: "no-status",
      name: "No Status",
      type: ColumnType.TODO,
    },
  ];

  if (!fieldsData?.nodes?.length) {
    return columns;
  }

  // Find status field
  const statusFields = fieldsData.nodes
    .filter(Boolean)
    .filter((field) => field!.dataType === "SINGLE_SELECT" && field!.name);

  // Prioritize a field named "Status"
  const statusField = statusFields.find((f) => f!.name === "Status") || statusFields[0];

  if (!statusField || !("options" in statusField) || !statusField.options?.length) {
    return columns;
  }

  // Add column options
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

    columns.push({
      id: option.id,
      name: option.name,
      type: columnType,
      fieldId: statusField.id,
      fieldName: statusField.name,
    });
  });

  return columns;
}

/**
 * Maps GitHub project items to our application BoardIssue model
 */
export function mapProjectIssues(
  itemsData?: GithubProjectData["items"],
  columns: Column[] = []
): BoardIssue[] {
  if (!itemsData?.nodes?.length) {
    return [];
  }

  return itemsData.nodes
    .filter(Boolean)
    .filter((item) => item!.content && item!.content.__typename === "Issue")
    .map((item) => {
      const content = item!.content!;

      // Find which column this issue belongs to
      let columnId = "no-status";
      let status = "No Status";

      // Check field values to determine status
      const fieldValues = item!.fieldValues?.nodes || [];
      const statusValue = fieldValues.find(
        (fv) => fv && fv.__typename === "ProjectV2ItemFieldSingleSelectValue"
      );

      if (statusValue && "optionId" in statusValue) {
        columnId = statusValue.optionId as string;

        // Find the column name from the columns list
        const column = columns.find((col) => col.id === columnId);
        if (column) {
          status = column.name;
        }
      }

      return {
        id: item!.id,
        issueId: content.id,
        title: content.title,
        body: content.body || "",
        number: content.number,
        status,
        columnId,
        labels: (content.labels?.nodes || []).filter(Boolean).map((label) => ({
          id: label!.id,
          name: label!.name,
          color: `#${label!.color}`,
          description: label!.description || "",
        })),
        url: content.url,
        author: content.author
          ? {
              login: content.author.login,
              avatarUrl: content.author.avatarUrl,
            }
          : null,
        assignees: (content.assignees?.nodes || []).filter(Boolean).map((assignee) => ({
          login: assignee!.login,
          avatarUrl: assignee!.avatarUrl,
        })),
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
      };
    });
}

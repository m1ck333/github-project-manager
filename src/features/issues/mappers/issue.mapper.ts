import { Issue as GithubIssue, ProjectV2Item } from "@/api-github/schema/github-schema";

import { Issue } from "../types/issue.types";

/**
 * Maps GitHub issues to our internal Issue model
 */
export function mapToIssues(issuesData: GithubIssue[]): Issue[] {
  if (!issuesData.length) return [];

  return issuesData.map((issue) => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    url: issue.url,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    assignees:
      issue.assignees?.nodes?.map((assignee) => ({
        login: assignee?.login || "",
        name: assignee?.name || null,
        avatarUrl: assignee?.avatarUrl || "",
        bio: assignee?.bio || null,
        location: assignee?.location || null,
        company: assignee?.company || null,
        email: assignee?.email || null,
        websiteUrl: assignee?.websiteUrl || null,
        twitterUsername: assignee?.twitterUsername || null,
      })) || [],
    labels:
      issue.labels?.nodes?.map((label) => ({
        id: label?.id || "",
        name: label?.name || "",
        color: label?.color || "",
      })) || [],
  }));
}

/**
 * Extracts and maps issues from project items
 */
export function mapProjectItemsToIssues(projectItems?: (ProjectV2Item | null)[]): Issue[] {
  if (!projectItems?.length) return [];

  const issueItems: GithubIssue[] = [];

  projectItems.forEach((item) => {
    if (item?.content?.__typename === "Issue") {
      issueItems.push(item.content as GithubIssue);
    }
  });

  return mapToIssues(issueItems);
}

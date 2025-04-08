import { formatDate } from "@/common/utils/date.utils";

import { Project } from "../types";

/**
 * Performs text-based search across project fields
 */
export function searchProjectText(project: Project, query: string): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = query.toLowerCase().trim();

  // Search through project name and description
  const nameMatch = project.name.toLowerCase().includes(normalizedQuery);
  const descMatch = project.description?.toLowerCase().includes(normalizedQuery) || false;

  // Search through creator/owner information
  const creatorMatch = project.createdBy?.login?.toLowerCase().includes(normalizedQuery) || false;
  const ownerMatch = project.owner?.login?.toLowerCase().includes(normalizedQuery) || false;

  // Search through repository and issue counts
  const repoCountMatch = String(project.repositories?.length || 0).includes(normalizedQuery);
  const issueCountMatch = String(project.issues?.length || 0).includes(normalizedQuery);

  // Search through formatted dates
  const createdDateStr = project.createdAt ? formatDate(project.createdAt).toLowerCase() : "";
  const updatedDateStr = project.updatedAt ? formatDate(project.updatedAt).toLowerCase() : "";
  const dateMatch =
    createdDateStr.includes(normalizedQuery) || updatedDateStr.includes(normalizedQuery);

  // Search through labels
  const labelsMatch =
    project.labels?.some(
      (label) =>
        label.name.toLowerCase().includes(normalizedQuery) ||
        label.color.toLowerCase().includes(normalizedQuery)
    ) || false;

  // Search through repositories
  const reposMatch =
    project.repositories?.some(
      (repo) =>
        repo.name.toLowerCase().includes(normalizedQuery) ||
        repo.description?.toLowerCase().includes(normalizedQuery) ||
        repo.owner?.login.toLowerCase().includes(normalizedQuery)
    ) || false;

  // Return true if any field matches
  return (
    nameMatch ||
    descMatch ||
    creatorMatch ||
    ownerMatch ||
    repoCountMatch ||
    issueCountMatch ||
    dateMatch ||
    labelsMatch ||
    reposMatch
  );
}

/**
 * Filters projects by labels
 */
export function filterByLabels(projects: Project[], labelIds: string[]): Project[] {
  if (!labelIds.length) return projects;

  return projects.filter((project) => {
    if (!project.labels || project.labels.length === 0) {
      return false;
    }

    // Check if project has at least one of the filtered labels
    return project.labels.some((label) => labelIds.includes(label.id));
  });
}

/**
 * Filters projects by column types (status)
 */
export function filterByStatus(projects: Project[], statusTypes: string[]): Project[] {
  if (!statusTypes.length) return projects;

  return projects.filter((project) => {
    if (!project.columns || project.columns.length === 0) {
      return false;
    }

    // Check if project has at least one column with the filtered type
    return project.columns.some((column) => statusTypes.includes(column.type));
  });
}

/**
 * Sorts projects by given field and direction
 */
export function sortProjects(
  projects: Project[],
  sortField: string,
  sortDirection: "asc" | "desc"
): Project[] {
  return [...projects].sort((a, b) => {
    let valueA: string | number | Date | undefined;
    let valueB: string | number | Date | undefined;

    // Handle special sort fields
    switch (sortField) {
      case "createdAt":
      case "updatedAt":
        valueA = new Date(a[sortField] || 0).getTime();
        valueB = new Date(b[sortField] || 0).getTime();
        break;

      case "repositoryCount":
        valueA = a.repositories?.length || 0;
        valueB = b.repositories?.length || 0;
        break;

      case "issueCount":
        valueA = a.issues?.length || 0;
        valueB = b.issues?.length || 0;
        break;

      default:
        valueA = (a[sortField as keyof Project] as string) || "";
        valueB = (b[sortField as keyof Project] as string) || "";
    }

    // Sort alphabetically for strings
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }

    // Convert to numbers for comparison
    const numA = Number(valueA) || 0;
    const numB = Number(valueB) || 0;

    // Sort numerically
    return sortDirection === "asc" ? numA - numB : numB - numA;
  });
}

import { formatDate } from "@/common/utils/date.utils";

import { Project } from "../types";

/**
 * Performs text-based search across project fields
 */
export function searchProjectText(project: Project, query: string): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = query.toLowerCase().trim();

  // Basic project fields
  if (project.name.toLowerCase().includes(normalizedQuery)) return true;
  if (project.description?.toLowerCase().includes(normalizedQuery)) return true;

  // User information
  if (project.createdBy?.login?.toLowerCase().includes(normalizedQuery)) return true;
  if (project.owner?.login?.toLowerCase().includes(normalizedQuery)) return true;

  // Counts
  if (String(project.repositories?.length || 0).includes(normalizedQuery)) return true;
  if (String(project.issues?.length || 0).includes(normalizedQuery)) return true;

  // Dates
  const createdDateStr = project.createdAt ? formatDate(project.createdAt).toLowerCase() : "";
  const updatedDateStr = project.updatedAt ? formatDate(project.updatedAt).toLowerCase() : "";
  if (createdDateStr.includes(normalizedQuery) || updatedDateStr.includes(normalizedQuery))
    return true;

  // Labels
  if (
    project.labels?.some(
      (label) =>
        label.name.toLowerCase().includes(normalizedQuery) ||
        label.color.toLowerCase().includes(normalizedQuery)
    )
  )
    return true;

  // Repositories
  if (
    project.repositories?.some(
      (repo) =>
        repo.name.toLowerCase().includes(normalizedQuery) ||
        repo.description?.toLowerCase().includes(normalizedQuery) ||
        repo.owner?.login.toLowerCase().includes(normalizedQuery)
    )
  )
    return true;

  return false;
}

/**
 * Filters projects by labels
 */
export function filterByLabels(projects: Project[], labelIds: string[]): Project[] {
  if (!labelIds.length) return projects;

  return projects.filter((project) => project.labels?.some((label) => labelIds.includes(label.id)));
}

/**
 * Filters projects by column types (status)
 */
export function filterByStatus(projects: Project[], statusTypes: string[]): Project[] {
  if (!statusTypes.length) return projects;

  return projects.filter((project) =>
    project.columns?.some((column) => statusTypes.includes(column.type))
  );
}

/**
 * Sorts projects by given field and direction
 */
export function sortProjects(
  projects: Project[],
  sortField: string,
  sortDirection: "asc" | "desc"
): Project[] {
  const multiplier = sortDirection === "asc" ? 1 : -1;

  return [...projects].sort((a, b) => {
    let valueA: string | number;
    let valueB: string | number;

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
        // Handle string fields
        if (typeof a[sortField as keyof Project] === "string") {
          valueA = (a[sortField as keyof Project] as string) || "";
          valueB = (b[sortField as keyof Project] as string) || "";
          return multiplier * valueA.localeCompare(valueB);
        }

        // Default to numeric comparison
        valueA = Number(a[sortField as keyof Project]) || 0;
        valueB = Number(b[sortField as keyof Project]) || 0;
    }

    return multiplier * (Number(valueA) - Number(valueB));
  });
}

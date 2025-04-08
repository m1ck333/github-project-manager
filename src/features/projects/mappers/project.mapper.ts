import { ProjectV2, Repository } from "@/api-github/generated/graphql";
import { mapToColumns } from "@/features/columns/mappers";
import { mapProjectItemsToIssues } from "@/features/issues/mappers/issue.mapper";
import { mapToLabels } from "@/features/labels/mappers";
import { mapToRepository } from "@/features/repositories";
import { mapAnyUserType } from "@/features/user/mappers";

import { Project } from "../types";

export function mapToProject(projectData: ProjectV2): Project {
  return {
    id: projectData.id,
    name: projectData.title,
    description: projectData.shortDescription || "",
    createdAt: projectData.createdAt,
    updatedAt: projectData.updatedAt,
    url: projectData.url,
    html_url: projectData.url,

    createdBy: projectData.creator
      ? mapAnyUserType(projectData.creator)
      : projectData.owner
        ? mapAnyUserType(projectData.owner)
        : undefined,

    owner: projectData.owner ? mapAnyUserType(projectData.owner) : undefined,

    repositories: projectData.repositories?.nodes
      ? projectData.repositories.nodes
          .filter((repo): repo is Repository => repo !== null)
          .map((repo) => mapToRepository({ id: repo.id, name: repo.name }))
      : [],
    columns: mapToColumns(projectData.fields),
    issues: mapProjectItemsToIssues(projectData.items?.nodes || []),
    collaborators: [], // Collaborators are not directly available in ProjectV2
    labels: mapToLabels(projectData.items?.nodes || []),
  };
}

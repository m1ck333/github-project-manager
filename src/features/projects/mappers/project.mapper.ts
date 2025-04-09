import { ProjectV2, Repository } from "@/api-github/generated/graphql";
import { BaseMapper } from "@/common/mappers";
import { mapToColumns } from "@/features/columns/mappers";
import { mapProjectItemsToIssues } from "@/features/issues/mappers/issue.mapper";
import { mapToLabels } from "@/features/labels/mappers";
import { mapToRepository } from "@/features/repositories";
import { mapAnyUserType } from "@/features/user/mappers";

import { Project } from "../types";

export class ProjectMapper extends BaseMapper<Project, ProjectV2> {
  toDomain(apiModel: Partial<ProjectV2>): Project {
    if (!apiModel) return {} as Project;

    return {
      id: this.getString(apiModel.id),
      name: this.getString(apiModel.title),
      description: apiModel.shortDescription || "",
      createdAt: this.getDateString(apiModel.createdAt),
      updatedAt: this.getDateString(apiModel.updatedAt),
      url: this.getString(apiModel.url),
      html_url: this.getString(apiModel.url),

      createdBy: apiModel.creator
        ? mapAnyUserType(apiModel.creator)
        : apiModel.owner
          ? mapAnyUserType(apiModel.owner)
          : undefined,

      owner: apiModel.owner ? mapAnyUserType(apiModel.owner) : undefined,

      repositories: apiModel.repositories?.nodes
        ? apiModel.repositories.nodes
            .filter((repo): repo is Repository => repo !== null)
            .map((repo) => mapToRepository({ id: repo.id, name: repo.name }))
        : [],
      columns: mapToColumns(apiModel.fields) || [],
      issues: mapProjectItemsToIssues(apiModel.items?.nodes || []) || [],
      collaborators: [],
      labels: mapToLabels(apiModel.items?.nodes || []) || [],
    };
  }

  toApi(project: Project): ProjectV2 {
    return {
      id: project.id,
      title: project.name,
      shortDescription: project.description || null,
      url: project.url || project.html_url || "",
      createdAt: project.createdAt,
      updatedAt: project.updatedAt || "",
    } as unknown as ProjectV2;
  }
}

const projectMapper = new ProjectMapper();

export function mapToProject(projectData: ProjectV2): Project {
  return projectMapper.toDomain(projectData);
}

export function mapToApiProject(project: Project): ProjectV2 {
  return projectMapper.toApi(project);
}

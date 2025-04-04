import {
  Repository,
  RepositoryOwner,
  RepositoryCollaborator,
} from "@/features/repositories/types/repository";
import { RepositoryApiModel } from "@/features/repositories/types/repository-api.types";

/**
 * Map API model to domain model
 */
export function mapToRepository(apiModel: Partial<RepositoryApiModel>): Repository {
  if (!apiModel) return {} as Repository;

  // Map collaborators if they exist
  const collaborators: RepositoryCollaborator[] = [];
  if (apiModel.collaborators?.edges) {
    apiModel.collaborators.edges.forEach((edge) => {
      if (edge?.node) {
        collaborators.push({
          id: edge.node.id,
          login: edge.node.login,
          avatarUrl: edge.node.avatarUrl,
          permission: edge.permission || "READ",
        });
      }
    });
  }

  // Map owner
  const owner: RepositoryOwner = {
    login: apiModel.owner?.login || "",
    avatar_url: apiModel.owner?.avatarUrl || "",
  };

  // Map repository
  const repository: Repository = {
    id: apiModel.id || "",
    name: apiModel.name || "",
    description: apiModel.description || undefined,
    url: apiModel.url || "",
    html_url: apiModel.url || "", // Use URL as HTML URL if not provided
    owner,
    createdAt: apiModel.createdAt || new Date().toISOString(),
    updatedAt: apiModel.updatedAt || undefined,
    isPrivate: apiModel.isPrivate || apiModel.visibility === "PRIVATE",
    visibility: apiModel.visibility || "PUBLIC",
    collaborators: collaborators.length > 0 ? collaborators : undefined,
  };

  return repository;
}

/**
 * Map domain model to API model
 */
export function mapToDomainModel(repository: Repository): RepositoryApiModel {
  return {
    id: repository.id,
    name: repository.name,
    owner: {
      login: repository.owner.login,
      avatarUrl: repository.owner.avatar_url,
    },
    description: repository.description || null,
    url: repository.url || repository.html_url || "",
    createdAt: repository.createdAt,
    updatedAt: repository.updatedAt,
    isPrivate: repository.isPrivate || false,
    isTemplate: false,
    visibility: repository.visibility || (repository.isPrivate ? "PRIVATE" : "PUBLIC"),
    collaborators: repository.collaborators
      ? {
          edges: repository.collaborators.map((collaborator) => ({
            permission: collaborator.permission || "READ",
            node: {
              id: collaborator.id,
              login: collaborator.login,
              avatarUrl: collaborator.avatarUrl,
            },
          })),
        }
      : undefined,
  };
}

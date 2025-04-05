import { BaseMapper } from "@/common/mappers/base.mapper";
import {
  Repository,
  RepositoryOwner,
  RepositoryCollaborator,
} from "@/features/repositories/types/repository";
import { RepositoryApiModel } from "@/features/repositories/types/repository-api.types";

/**
 * Repository mapper implementation
 */
export class RepositoryMapper extends BaseMapper<Repository, RepositoryApiModel> {
  /**
   * Map API model to domain model
   */
  toDomain(apiModel: Partial<RepositoryApiModel>): Repository {
    if (!apiModel) return {} as Repository;

    // Map collaborators if they exist
    const collaborators: RepositoryCollaborator[] = this.mapCollaborators(apiModel);

    // Map owner
    const owner: RepositoryOwner = {
      login: this.getString(apiModel.owner?.login),
      avatar_url: this.getString(apiModel.owner?.avatarUrl),
    };

    // Map repository
    const repository: Repository = {
      id: this.getString(apiModel.id),
      name: this.getString(apiModel.name),
      description: apiModel.description || undefined,
      url: this.getString(apiModel.url),
      html_url: this.getString(apiModel.url), // Use URL as HTML URL if not provided
      owner,
      createdAt: this.getDateString(apiModel.createdAt),
      updatedAt: apiModel.updatedAt || undefined,
      isPrivate: this.getBoolean(apiModel.isPrivate, apiModel.visibility === "PRIVATE"),
      visibility: this.getString(apiModel.visibility, "PUBLIC"),
      collaborators: collaborators.length > 0 ? collaborators : undefined,
    };

    return repository;
  }

  /**
   * Map domain model to API model
   */
  toApi(repository: Repository): RepositoryApiModel {
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

  /**
   * Map API collaborators to domain collaborators
   */
  private mapCollaborators(apiModel: Partial<RepositoryApiModel>): RepositoryCollaborator[] {
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
    return collaborators;
  }
}

// Create singleton instance
const repositoryMapper = new RepositoryMapper();

/**
 * Map API model to domain model using the singleton mapper
 */
export function mapToRepository(apiModel: Partial<RepositoryApiModel>): Repository {
  return repositoryMapper.toDomain(apiModel);
}

/**
 * Map domain model to API model using the singleton mapper
 */
export function mapToDomainModel(repository: Repository): RepositoryApiModel {
  return repositoryMapper.toApi(repository);
}

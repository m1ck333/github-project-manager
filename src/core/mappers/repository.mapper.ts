import { Repository, RepositoryCollaborator } from "../types";

// GraphQL response interfaces
export interface GithubRepositoryData {
  id: string;
  name: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  description?: string | null;
  url: string;
  createdAt: string;
  collaborators?: {
    edges?: Array<{
      node: {
        id: string;
        login: string;
        avatarUrl: string;
      };
      permission?: string;
    } | null> | null;
  } | null;
}

/**
 * Maps GitHub repository data to our application Repository model
 */
export function mapToRepository(repoData: GithubRepositoryData): Repository {
  return {
    id: repoData.id,
    name: repoData.name,
    owner: {
      login: repoData.owner.login,
      avatar_url: repoData.owner.avatarUrl,
    },
    description: repoData.description || "",
    html_url: repoData.url,
    createdAt: repoData.createdAt,
    collaborators: mapRepositoryCollaborators(repoData.collaborators),
  };
}

/**
 * Maps GitHub collaborator edges to our application RepositoryCollaborator model
 */
export function mapRepositoryCollaborators(
  collaboratorsData?: GithubRepositoryData["collaborators"]
): RepositoryCollaborator[] {
  if (!collaboratorsData?.edges?.length) {
    return [];
  }

  return collaboratorsData.edges.filter(Boolean).map((edge) => ({
    id: edge!.node.id,
    login: edge!.node.login,
    avatarUrl: edge!.node.avatarUrl,
    permission: edge!.permission || "READ",
  }));
}

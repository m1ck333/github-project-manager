export * from "./repository.mapper";
export {
  mapToProject,
  mapProjectColumns,
  mapProjectIssues,
} from "../../features/projects/lib/mappers";
export { mapToUserProfile } from "./user.mapper";

// Add re-exports from feature to maintain compatibility if needed
export type { GithubProjectData, GithubViewerData } from "../../features/projects/lib/mappers";

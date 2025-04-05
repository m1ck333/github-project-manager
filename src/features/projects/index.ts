import { issueService } from "../issues/services";
import { labelService } from "../labels/services";

import { projectCrudService, projectRelationsService, projectSearchService } from "./services";
import { projectStore } from "./stores";

// Export types first
export * from "./types";

// Export API operations - excluding types that would conflict
export {
  ProjectV2Roles,
  ProjectV2FieldType,
  GetAllInitialData,
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  AddProjectItemDocument,
  LinkRepositoryToProjectDocument,
  CreateIssueDocument,
  DeleteIssueDocument,
  UpdateIssueStatusDocument,
  CreateLabelDocument,
  AddColumnDocument,
} from "./api";

// Export other feature modules
export * from "./components";
export * from "./hooks";
export * from "./services";
export * from "./stores";
export * from "./mappers";
// Exclude validation since it conflicts with types
// export * from "./validation";

// Convenience export for external modules
export const Projects = {
  store: projectStore,
  services: {
    crud: projectCrudService,
    relations: projectRelationsService,
    search: projectSearchService,
    issue: issueService,
    label: labelService,
  },
};

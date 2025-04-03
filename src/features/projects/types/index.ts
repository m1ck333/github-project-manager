// Export types from project.types.ts
export * from "./project.types";

// Export any additional types specific to the projects feature
export interface ProjectFilters {
  search?: string;
  status?: string;
  repository?: string;
}

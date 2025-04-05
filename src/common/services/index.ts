/**
 * Common service exports
 * This module exports base service classes that can be extended
 * by feature-specific services.
 */

// Export base CRUD service
export { AbstractCrudService } from "./base-crud.service";
export type { BaseCrudService } from "./base-crud.service";

// Export base search service
export { AbstractSearchService } from "./base-search.service";
export type { BaseSearchService, SearchCriteria } from "./base-search.service";

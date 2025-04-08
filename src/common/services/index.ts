/**
 * Common service exports
 * This module exports base service classes that can be extended
 * by feature-specific services.
 */

// Export base services
export { AbstractBaseService } from "./abstract-base.service";
export type { IAbstractBaseService } from "./abstract-base.service";

export { AbstractCacheableService } from "./abstract-cacheable.service";
export type { IAbstractCacheableService } from "./abstract-cacheable.service";

// Export base search service
export { AbstractSearchService } from "./abstract-search.service";
export type { IAbstractSearchService, ISearchCriteria } from "./abstract-search.service";

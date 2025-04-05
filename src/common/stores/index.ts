/**
 * Common store exports
 * This module exports base store classes that can be extended
 * by feature-specific stores.
 */

// Export base store interfaces
export type { BaseEntityStore } from "./base-entity.store";

export type { BaseCrudStore } from "./base-crud.store";

export type { BaseSearchStore, SearchCriteria } from "./base-search.store";

// Export base store classes
export { AbstractEntityStore } from "./base-entity.store";

export { AbstractCrudStore } from "./base-crud.store";

export { AbstractSearchStore } from "./base-search.store";

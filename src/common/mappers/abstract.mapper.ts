import { getCurrentISOString } from "@/common/utils/date.utils";

/**
 * Base interface for all entity types
 */
export interface BaseEntity {
  id: string;
}

/**
 * Base interface for all API model types
 */
export interface BaseApiModel {
  id: string;
}

/**
 * Generic mapper interface
 */
export interface EntityMapper<TDomain extends BaseEntity, TApi extends BaseApiModel> {
  toDomain(apiModel: Partial<TApi>): TDomain;
  toApi(domainModel: TDomain): TApi;
}

/**
 * Base mapper class with common mapping functionality
 */
export abstract class BaseMapper<TDomain extends BaseEntity, TApi extends BaseApiModel>
  implements EntityMapper<TDomain, TApi>
{
  /**
   * Map API model to domain model
   */
  abstract toDomain(apiModel: Partial<TApi>): TDomain;

  /**
   * Map domain model to API model
   */
  abstract toApi(domainModel: TDomain): TApi;

  /**
   * Safely get a string value from an API model with a default
   */
  protected getString(value: string | null | undefined, defaultValue: string = ""): string {
    return value ?? defaultValue;
  }

  /**
   * Safely get a boolean value from an API model with a default
   */
  protected getBoolean(value: boolean | null | undefined, defaultValue: boolean = false): boolean {
    return value ?? defaultValue;
  }

  /**
   * Safely get a date string from an API model with a default
   */
  protected getDateString(value: string | null | undefined): string {
    return value ?? getCurrentISOString();
  }

  /**
   * Map a collection of API models to domain models
   */
  protected mapCollection<T extends BaseEntity, U extends BaseApiModel>(
    items: Array<U | null | undefined> | null | undefined,
    mapFn: (item: U) => T
  ): T[] {
    if (!items) return [];
    return items.filter(Boolean).map((item) => mapFn(item as U));
  }
}

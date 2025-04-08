import { AbstractBaseService, IAbstractBaseService } from "./abstract-base.service";

/**
 * Base cacheable service interface
 */
export interface IAbstractCacheableService extends IAbstractBaseService {
  isCacheValid(): boolean;
  updateCacheTimestamp(): void;
}

/**
 * Abstract base class for cacheable services
 * Provides common caching functionality
 */
export abstract class AbstractCacheableService
  extends AbstractBaseService
  implements IAbstractCacheableService
{
  protected _lastFetched: number | null = null;
  protected readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  isCacheValid(): boolean {
    if (!this._lastFetched) return false;
    return Date.now() - this._lastFetched < this.CACHE_DURATION;
  }

  updateCacheTimestamp(): void {
    this._lastFetched = Date.now();
  }

  protected async executeWithCache<T>(
    operation: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> {
    if (!forceRefresh && this.isCacheValid()) {
      return operation();
    }

    const result = await this.executeWithErrorHandling(operation);
    this.updateCacheTimestamp();
    return result;
  }
}

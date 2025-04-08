import { makeObservable, observable } from "mobx";

import { AbstractCacheableService } from "@/common/services";

import type { Project } from "../types";

/**
 * Base class for project services
 * Extends AbstractCacheableService to leverage common caching functionality
 */
export abstract class BaseProjectService extends AbstractCacheableService {
  @observable protected _items: Project[] = [];

  constructor() {
    super();
    makeObservable(this);
  }

  get items(): Project[] {
    return this._items;
  }

  getById(id: string): Project | undefined {
    return this._items.find((project) => project.id === id);
  }

  setItems(items: Project[]): void {
    this._items = [...items];
  }
}

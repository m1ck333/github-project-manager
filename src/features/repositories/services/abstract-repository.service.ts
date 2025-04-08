import { makeAutoObservable } from "mobx";

import { AbstractCacheableService } from "@/common/services";

export abstract class AbstractRepositoryService<T> extends AbstractCacheableService {
  protected _items: T[] = [];
  protected _selectedItem: T | null = null;

  constructor() {
    super();
    makeAutoObservable(this);
  }

  get items(): T[] {
    return this._items;
  }

  get selectedItem(): T | null {
    return this._selectedItem;
  }

  setSelectedItem(item: T | null): void {
    this._selectedItem = item;
  }

  protected setItems(items: T[]): void {
    this._items = items;
  }

  protected async fetchItems(): Promise<void> {
    throw new Error("fetchItems must be implemented by derived class");
  }

  protected async fetchItemById(id: string): Promise<void> {
    throw new Error("fetchItemById must be implemented by derived class");
  }

  protected async createItem(item: Partial<T>): Promise<void> {
    throw new Error("createItem must be implemented by derived class");
  }

  protected async updateItem(id: string, item: Partial<T>): Promise<void> {
    throw new Error("updateItem must be implemented by derived class");
  }

  protected async deleteItem(id: string): Promise<void> {
    throw new Error("deleteItem must be implemented by derived class");
  }
}

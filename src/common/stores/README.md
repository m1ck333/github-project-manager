# Common Stores Architecture

This directory contains base store classes and interfaces that can be extended by feature-specific stores.

## Overview

The purpose of the common stores architecture is to:

- **Reduce code duplication** across similar stores in different features
- **Standardize interfaces** for common state management operations
- **Provide reusable abstractions** for common store patterns
- **Create consistency** between services and stores

## Available Base Stores

### 1. Base Entity Store

Located in `./base/base-entity.store.ts`, this is the foundation for all entity stores:

- `AbstractEntityStore`: An abstract base class with common loading and error state management
- `BaseEntityStore`: An interface defining the contract for basic entity state management

### 2. Base CRUD Stores

Located in `./base/base-crud.store.ts`, these stores provide:

- `AbstractCrudStore<T>`: An abstract base class that extends `AbstractEntityStore` and implements common CRUD operations
- `BaseCrudStore<T>`: An interface extending `BaseEntityStore` that defines the contract for CRUD operations

### 3. Base Search Stores

Located in `./base/base-search.store.ts`, these stores provide:

- `AbstractSearchStore<T>`: An abstract base class that extends `AbstractEntityStore` and implements common search operations
- `BaseSearchStore<T>`: An interface extending `BaseEntityStore` that defines the contract for search operations
- `SearchCriteria`: An interface for defining search parameters

## Class Hierarchy

```
AbstractEntityStore
  ├── AbstractCrudStore<T>
  └── AbstractSearchStore<T>
```

## Usage Examples

### Extending the Base CRUD Store

```typescript
import { AbstractCrudStore } from "@/common/stores";
import { Project } from "../types";

export class ProjectCrudStore extends AbstractCrudStore<Project> {
  // Implement abstract methods and add feature-specific functionality

  create(project: Omit<Project, "id">): Project {
    // Implementation specific to Projects
    // ...

    // Return the created project
    return newProject;
  }

  // Add additional project-specific methods
  // ...
}

// Create a singleton instance
export const projectCrudStore = new ProjectCrudStore();
```

### Extending the Base Search Store

```typescript
import { AbstractSearchStore, SearchCriteria } from "@/common/stores";
import { Repository } from "../types";

export class RepositorySearchStore extends AbstractSearchStore<Repository> {
  search(criteria: SearchCriteria): Repository[] {
    // Implementation specific to Repository searching
    // ...

    // Set the search results
    this.setSearchResults(results);

    // Return the results
    return results;
  }

  // Add additional repository-specific search methods
  // ...
}

// Create a singleton instance
export const repositorySearchStore = new RepositorySearchStore();
```

## Best Practices

1. Always extend the base stores for new feature stores with similar functionality
2. Keep store and service logic separate - services handle API calls, stores handle state
3. Use MobX decorators consistently as shown in the base classes
4. Create singleton instances for stores that should be globally accessible
5. Keep base stores focused on common patterns, not specific business logic

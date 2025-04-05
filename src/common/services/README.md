# Common Services Architecture

This directory contains base service classes and interfaces that can be extended by feature-specific services.

## Overview

The purpose of the common services architecture is to:

- **Reduce code duplication** across similar services in different features
- **Standardize interfaces** for common operations like CRUD and search
- **Provide reusable abstractions** for common service patterns

## Available Base Services

### 1. Base CRUD Services

Located in `./base/base-crud.service.ts`, these services provide:

- `AbstractCrudService<T>`: An abstract base class that implements common CRUD operations
- `BaseCrudService<T>`: An interface defining the contract for CRUD operations

### 2. Base Search Services

Located in `./base/base-search.service.ts`, these services provide:

- `AbstractSearchService<T>`: An abstract base class that implements common search operations
- `BaseSearchService<T>`: An interface defining the contract for search operations
- `SearchCriteria`: An interface for defining search parameters

## Usage Examples

### Extending the Base CRUD Service

```typescript
import { AbstractCrudService } from "@/common/services";
import { Project } from "../types";

export class ProjectCrudService extends AbstractCrudService<Project> {
  // Implement abstract methods and add feature-specific functionality

  create(project: Omit<Project, "id">): Project {
    // Implementation specific to Projects
    // ...
  }

  // Add additional project-specific methods
  // ...
}
```

### Extending the Base Search Service

```typescript
import { AbstractSearchService, SearchCriteria } from "@/common/services";
import { Repository } from "../types";

export class RepositorySearchService extends AbstractSearchService<Repository> {
  search(criteria: SearchCriteria): Repository[] {
    // Implementation specific to Repository searching
    // ...
  }

  // Add additional repository-specific search methods
  // ...
}
```

## Best Practices

1. Always extend the base services for new feature services with similar functionality
2. Implement feature-specific logic in the derived classes
3. Keep base services focused on common patterns, not specific business logic

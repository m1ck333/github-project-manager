# Projects Feature Refactoring

## Summary of Changes

We've refactored the projects feature to improve separation of concerns, maintainability, and readability by:

1. Creating dedicated services for specific responsibilities
2. Extracting project-specific GraphQL queries from the monolithic app initialization
3. Establishing a cleaner data flow through the application
4. Breaking down complex mappers into smaller, focused functions
5. Creating a simplified project store with unified functionality
6. Adding a comprehensive hook for working with projects in components

## Key Architectural Changes

### Before

- `AppInitializationService` handled fetching all data including projects
- Project data logic was mixed with other application data
- Single monolithic GraphQL query for all app data
- Tight coupling between initialization and project functionality
- Large mapper functions with mixed responsibilities
- Multiple stores and services with overlapping functionality

### After

- Dedicated `ProjectDataService` for fetching project data
- Specific `ProjectOperationsService` for project operations
- Separated project GraphQL query
- Clear separation of concerns with distinct responsibilities
- Smaller, focused mapper functions for improved readability
- Unified `ProjectStore` with comprehensive functionality
- Unified `useProject` hook for simplified component integration

## New Components

1. **ProjectDataService**

   - Responsible for fetching project data
   - Handles caching, error handling, and retry logic
   - Single source of truth for project data retrieval

2. **ProjectOperationsService**

   - Handles operations like adding issues to projects
   - Manages moving issues between columns
   - Handles repository linking

3. **Project-specific GraphQL Query**

   - Created `getProjects.graphql` query
   - Focused on just project data

4. **Improved Project Mappers**

   - Broke down large mapper functions into smaller, focused ones
   - Each function has a single responsibility
   - Improved readability and maintainability

5. **Simplified ProjectStore**

   - Unified store with comprehensive functionality
   - Observable state for project data
   - Methods for manipulating projects and issues
   - Support for filtering and selection

6. **useProject Hook**
   - Comprehensive hook for working with projects in components
   - Encapsulates loading, error states, and data access
   - Provides all necessary operations in a single API
   - Simplifies component integration

## Data Flow

Our new architecture follows this flow:

1. API/GraphQL → Project Data Service → Mappers → Store → useProject Hook → Components

This design provides several benefits:

- Each component has a single responsibility
- Easier testing
- More maintainable code
- Clearer dependencies
- Improved developer experience

## Simplified Component Usage

Before refactoring, components needed to:

- Import multiple services and stores
- Manage loading and error states manually
- Coordinate between different data sources

After refactoring, components can:

```tsx
import { useProject } from '@/features/projects/hooks';

const MyComponent = () => {
  const {
    loading,
    error,
    projects,
    loadProjects,
    moveIssueBetweenColumns
  } = useProject();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    // Render projects and interact with them
  );
};
```

## Next Steps

To fully complete this refactoring:

1. Run GraphQL codegen to generate types for the new query
2. Fix the remaining TypeScript errors in our implementations
3. Add unit tests for the new services and hooks
4. Consider further separation of column and issue management
5. Refactor other parts of the application using similar patterns

# Projects Feature

This feature manages GitHub Projects V2, providing functionality to view, create, update, and delete projects, as well as manage project items like issues and columns.

## Architecture

The Projects feature follows a clean architecture with separation of concerns:

### Data Flow

```
GraphQL API → Data Service → Mappers → Store → Components
```

1. **API Layer**: GraphQL queries and mutations in `api/`
2. **Data Service**: Handles data fetching with caching and error handling in `services/project-data.service.ts`
3. **CRUD Service**: Manages create, read, update, delete operations in `services/project-crud.service.ts`
4. **Mappers**: Transform API responses to domain models in `mappers/`
5. **Store**: State management via MobX in `stores/`
6. **Components**: React components to display and interact with projects

### Key Components

- **ProjectDataService**: Responsible for fetching project data from the API
- **ProjectCrudService**: Manages the project data and CRUD operations
- **ProjectRelationsService**: Handles relationships between projects and other entities
- **ProjectSearchService**: Provides search functionality for projects
- **Project Mappers**: Transform API data to domain models

## Data Model

The main entities in this feature are:

- **Project**: Represents a GitHub Project V2
- **Column**: Represents a status column in a project board
- **BoardIssue**: Represents an issue within a project board
- **Label**: Represents a label that can be applied to issues

## Usage

```typescript
// Fetch all projects
Projects.services.data.fetchProjects();

// Get all projects
const projects = Projects.services.crud.getProjects();

// Get a specific project
const project = Projects.services.crud.getProjectById(projectId);

// Create a new project
const newProject = await Projects.services.crud.createProject(projectData, ownerId);

// Update a project
const updatedProject = await Projects.services.crud.updateProject(projectId, projectData);

// Delete a project
await Projects.services.crud.deleteProject(projectId);
```

## Queries and Mutations

The main GraphQL operations are:

- `GetProjects`: Fetches all projects owned by the user
- `CreateProject`: Creates a new project
- `UpdateProject`: Updates an existing project
- `DeleteProject`: Deletes a project

See `api-github/operations/projects/queries/getProjects.graphql` for the main query structure.

## Directory Structure

- **api/** - API integration, including GraphQL queries and mutations
- **components/** - React components specific to projects
  - **atoms/** - Simple, base components
  - **molecules/** - Combinations of atoms
  - **organisms/** - Complex components with business logic
- **pages/** - Top-level page components
- **services/** - Business logic services
- **stores/** - State management (MobX stores)
- **types/** - TypeScript types and interfaces
- **validation/** - Schema validation

## Error Handling

We've implemented a consistent error handling approach across components using the `useAsync` hook:

```tsx
import { useAsync } from "@/common/hooks";
import { createError } from "@/common/utils/errors";

const MyComponent = () => {
  const { isLoading, error, execute, resetError } = useAsync();

  const handleSomeAction = async () => {
    const result = await execute(async () => {
      // Your async code here
      if (somethingWrong) {
        throw createError("Error message");
      }
      return data;
    });

    if (result) {
      // Handle successful result
    }
  };

  return (
    <div>
      {isLoading && <Loading />}
      {error && <Error error={error} onRetry={resetError} />}
      {/* Rest of the component */}
    </div>
  );
};
```

### Key Benefits

1. **Simplified Code** - No complex try/catch blocks in components
2. **Consistent UI** - Loading and error states are handled consistently
3. **Reusable Logic** - Loading and error handling logic is abstracted
4. **Type Safety** - Full TypeScript support

## Best Practices

1. Use the `useAsync` hook for all async operations
2. Always handle loading and error states in the UI
3. Use `createError` for consistent error creation
4. Make error messages helpful and user-friendly

## Example Components

See `ProjectRepositories` for an example of proper error handling implementation.

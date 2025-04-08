# Simplified Project Feature Refactoring

## Summary of Changes

Following feedback, I've simplified the refactoring to focus **only on project management** without issues or columns:

1. Removed all issue and column-related code
2. Focused only on core project operations (create, read, update, delete)
3. Eliminated unnecessary complexity
4. Created clean, focused files with single responsibilities

## Simplified File Structure

### Mappers

- `types.ts` - Basic GraphQL response types
- `project.mapper.ts` - Maps API data to Project model
- `user.mapper.ts` - Simple user mapping

### Store

- `types.ts` - Minimal state definition and interfaces
- `project-actions.ts` - Core project CRUD actions
- `project-selectors.ts` - Simple selectors for projects
- `project.store.ts` - Minimal store implementation

### Services

- `project-data.service.ts` - Fetches project data
- `project-crud.service.ts` - Handles project operations

### Hooks

- `useProject.ts` - Simplified hook for projects only

## Key Improvements

### 1. Cleaner State Management

```typescript
// Before: Complex state with issues, columns, filters
@observable private _state = {
  projects: [],
  selectedProjectId: null,
  issueFilter: "",
  selectedColumnId: null,
  // ...plus many other properties
};

// After: Simple focused state
@observable private _state: ProjectState = {
  projects: [],
  selectedProjectId: null,
};
```

### 2. Simpler Project Model

```typescript
// Before: Complex project model with many relationships
export interface Project {
  id: string;
  name: string;
  // ...basic properties
  columns?: Column[];
  issues?: BoardIssue[];
  collaborators?: RepositoryCollaborator[];
  repositories?: ProjectRepository[];
  labels?: Label[];
}

// After: Focused project model
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  url?: string;
  // ...just core properties
  repositories?: ProjectRepository[];
  // Empty arrays for backward compatibility
  columns?: any[];
  issues?: any[];
}
```

### 3. Cleaner Hook API

```typescript
// Before: Complex hook with many features
const {
  projects,
  selectedProject,
  filteredIssues,
  columns,
  labels,
  moveIssueBetweenColumns,
  setIssueFilter,
  selectColumn,
  // ...many other properties
} = useProject();

// After: Simple project-focused hook
const { projects, selectedProject, loadProjects, createProject, updateProject, deleteProject } =
  useProject();
```

## Benefits

1. **Focus** - Focused only on project management
2. **Simplicity** - Much easier to understand and maintain
3. **Testability** - Simple components make testing easier
4. **Consistency** - Common patterns across files
5. **Reduced Coupling** - Decoupled from issue management

## Next Steps

1. Fix remaining TypeScript errors
2. Add proper tests for the simplified components
3. Apply similar patterns to other features as needed

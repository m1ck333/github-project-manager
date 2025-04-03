# Feature Structure Guidelines

This document outlines the structure and naming conventions for feature folders in our application, following the feature-sliced architecture principles.

## Directory Structure

Each feature should follow this structure:

```
src/features/[feature-name]/
├── api/                 # API-related code (GraphQL operations, REST endpoints)
│   ├── mutations/       # GraphQL mutations
│   ├── queries/         # GraphQL queries
│   └── index.ts         # Public API exports
├── components/          # UI components specific to the feature
│   ├── atoms/           # Atomic design: basic building blocks
│   ├── molecules/       # Atomic design: groups of atoms
│   ├── organisms/       # Atomic design: groups of molecules/atoms
│   └── index.ts         # Public component exports
├── hooks/               # Custom React hooks for the feature
├── lib/                 # Feature-specific utilities
│   ├── mappers/         # Data transformation functions
│   ├── helpers/         # Helper functions
│   └── constants/       # Constants and enums
├── pages/               # Page components that compose the feature
├── services/            # Business logic services
├── stores/              # State management (MobX stores)
├── types/               # TypeScript types and interfaces
├── validation/          # Form validation schemas
└── index.ts             # Public feature API
```

## Naming Conventions

1. **Folders**: Use kebab-case for directory names (e.g., `project-board`).
2. **Files**:

   - React components: Use PascalCase (e.g., `ProjectCard.tsx`).
   - Services, stores, and utility files: Use kebab-case (e.g., `project-board.store.ts`).
   - Type definitions: Use kebab-case (e.g., `project.types.ts`).
   - Index files: Use `index.ts` for exporting public APIs.

3. **Component Structure**:

   - Each component should have its own directory with an `index.tsx` file.
   - Include a `.module.scss` file for component-specific styles.
   - Example:
     ```
     components/molecules/ProjectCard/
     ├── index.tsx
     └── ProjectCard.module.scss
     ```

4. **Export Pattern**:
   - Always use named exports in feature modules.
   - Aggregate and re-export components and functions in index files.
   - Avoid default exports except for page components.

## Best Practices

1. **Encapsulation**: Each feature should be self-contained and expose only what's necessary.
2. **Dependency Direction**: Higher-level features can import from lower-level features, but not vice versa.
3. **Shared Code**: Place shared utilities in `src/common` or `src/core`, not in feature folders.
4. **Types**: Keep domain-specific types in the feature's `types` folder.
5. **Testing**: Include tests alongside the code they test, or in a parallel test structure.

## Example Feature Index File

```typescript
// src/features/projects/index.ts
// Re-export public API from each module
export * from "./types";
export * from "./stores";
export * from "./services";
export * from "./validation";

// Create a feature-related exports object for convenience
import { projectCrudService, projectRelationsService } from "./services";
import { projectStore } from "./stores";

export const Projects = {
  store: projectStore,
  services: {
    crud: projectCrudService,
    relations: projectRelationsService,
  },
};
```

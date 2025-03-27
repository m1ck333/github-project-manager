# GraphQL Architecture

This directory contains the GraphQL implementation for the application, organized according to best practices for maintainability, type-safety, and developer experience.

## Directory Structure

```
src/graphql/
├── projects/
│   ├── queries/            # Project-related queries
│   ├── mutations/          # Project-related mutations
│   └── fragments/          # Reusable fragments for projects
├── issues/
│   ├── queries/            # Issue-related queries
│   ├── mutations/          # Issue-related mutations
│   └── fragments/          # Reusable fragments for issues
├── columns/
│   ├── queries/            # Column-related queries
│   └── mutations/          # Column-related mutations
├── labels/
│   ├── queries/            # Label-related queries
│   └── mutations/          # Label-related mutations
├── collaborators/
│   ├── queries/            # Collaborator-related queries
│   └── mutations/          # Collaborator-related mutations
├── generated/              # Auto-generated code
│   ├── graphql.ts          # Generated TypeScript types
│   ├── index.ts            # Export file for generated code
│   └── ...
├── services/               # Service layer for business logic
│   ├── ProjectService.ts
│   ├── IssueService.ts
│   └── ...
├── client.ts               # GraphQL client configuration
├── cache.ts                # Cache configuration
├── utils.ts                # Utility functions
└── index.ts                # Main export file
```

## Key Features

1. **Separation of Concerns**

   - GraphQL operations are organized by domain (projects, issues, etc.)
   - Each operation is stored in its own file with a clear purpose
   - Service layer abstracts GraphQL operations from application code

2. **Type Safety**

   - All GraphQL operations generate TypeScript types
   - Strongly-typed hooks ensure compile-time safety
   - Transformation functions safely convert between API and application models

3. **Reusability**
   - Fragments allow sharing of field selections across operations
   - Utility functions encapsulate common transformations
   - Services provide a consistent API for component use

## Development Workflow

1. **Creating a new operation**

   - Add `.graphql` file in the appropriate domain directory
   - Run codegen to generate TypeScript types (`npm run codegen`)
   - Use the generated hooks/operations in services

2. **Accessing data in components**
   - Import service methods from `src/graphql/services`
   - Call service methods to perform operations
   - Benefit from strongly-typed results and error handling

## Migration from src/api

This architecture replaces the older structure in `src/api` with a more modular approach. To complete the migration:

1. **Implemented services:**

   - ProjectService (complete)
   - ColumnService (partial - missing mutation implementation)
   - IssueService (partial - should verify field handling)

2. **Services to complete:**

   - LabelService
   - CollaboratorService

3. **Additional components needed:**

   - Complete column mutation operations (createColumn, deleteColumn)
   - Fix type errors in existing services
   - Add proper error handling

4. **When to delete src/api:**
   - Only after all functionality has been migrated to src/graphql
   - After verifying that all components are using the new services
   - After ensuring all tests pass with the new implementation

## GraphQL Client

The application uses URQL as the GraphQL client for its lightweight approach and excellent performance. The client configuration includes:

- GitHub API authentication
- Caching for improved performance
- Error handling

## Code Generation

TypeScript types are generated from the GraphQL schema and operations using GraphQL Code Generator. This ensures:

- Type-safe query results
- Autocompletion for query fields
- Consistent typing across the application

To generate types:

```bash
npm run codegen
```

## Best Practices

1. **Always use fragments** for shared field selections
2. **Keep queries focused** and request only the fields you need
3. **Handle errors consistently** in service methods
4. **Transform API responses** to match application models
5. **Document complex operations** with comments

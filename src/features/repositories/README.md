# Repositories Feature

This feature handles all repository-related functionality, including listing, viewing, and managing GitHub repositories.

## Directory Structure

```
repositories/
├── api/              # API-related code, including GraphQL queries and mutations
├── components/       # UI components organized by atomic design
│   ├── atoms/        # Small, single-purpose components
│   ├── molecules/    # Components composed of atoms
│   └── organisms/    # Complex components composed of molecules and atoms
├── hooks/            # Custom React hooks specific to repositories
├── lib/              # Utility functions and helpers
├── pages/            # Page components
├── services/         # Business logic and data handling
├── stores/           # MobX state management
├── types/            # TypeScript type definitions
└── validation/       # Form validation schemas
```

## Error Handling

This feature uses the common `useAsync` hook for consistent error handling. Each operation that can fail should use this hook to handle loading states and errors.

```tsx
import { useAsync } from "@/common/hooks";

// Inside your component
const { isLoading, error, execute, resetError } = useAsync();

// Use the execute function to perform async operations
const handleOperation = () => {
  execute(async () => {
    // Your async code here
    await repositoryService.someOperation();
  });
};

// Show loading state
if (isLoading) return <Loading />;

// Show error state
if (error) return <Error error={error} onRetry={resetError} />;
```

## Key Benefits

- **Centralized Repository Management**: Provides a unified interface for interacting with GitHub repositories
- **Consistent Error Handling**: Uses the application-wide error handling pattern with `useAsync`
- **Type Safety**: Strong TypeScript typing for repository data and operations
- **Atomic Design**: Components organized by complexity following atomic design principles

## Best Practices

1. Use the `useAsync` hook for all async operations
2. Put business logic in services, not components
3. Keep components focused on UI rendering and user interaction
4. Use MobX for state management according to the app's patterns
5. Implement proper loading and error states for all user actions

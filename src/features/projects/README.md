# Projects Feature

This feature directory contains components, services, and utilities related to project management in the application.

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

# Routes Architecture

This directory contains the routing configuration and components for the application.

## Overview

The routes architecture is designed to:

- **Centralize route definitions** in a single location
- **Provide type safety** for route paths and parameters
- **Separate routing logic** from component implementation
- **Standardize error handling** for route-level errors

## Structure

```
routes/
  ├── AppRoutes.tsx       # Main routes component with error handling
  ├── index.ts            # Exports for routes module
  ├── README.md           # This documentation
  │
  ├── config/             # Route configuration
  │   └── routes.ts       # Route definitions and helpers
  │
  └── guards/             # Route guards (future)
      └── AuthGuard.tsx   # Authentication guard (to be implemented)
```

## Route Configuration

Routes are defined in `config/routes.ts` using three main exports:

1. `ROUTE_PATHS`: Constants for all route paths with parameters (e.g. `/projects/:projectId`)
2. `ROUTES`: Helper functions to generate route paths with parameters (e.g. `ROUTES.PROJECT_DETAIL("123")`)
3. `NAV_GROUPS`: Groupings of routes for navigation menus

## Error Handling

The `AppRoutes` component includes:

- Global error boundary for capturing unhandled errors
- Route-level error handling
- Navigation to error pages
- Fallback for non-existent routes (404)

## Usage Examples

### Using Route Helpers

```typescript
import { ROUTES } from '@/routes';
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();

  const handleNavigate = (projectId: string) => {
    // Generates "/projects/123"
    navigate(ROUTES.PROJECT_DETAIL(projectId));
  };

  return (
    <button onClick={() => handleNavigate('123')}>
      View Project
    </button>
  );
};
```

### Using Navigation Groups

```typescript
import { NAV_GROUPS } from '@/routes';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav>
      <ul>
        {NAV_GROUPS.MAIN.map(item => (
          <li key={item.path}>
            <NavLink to={item.path}>{item.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

## Best Practices

1. Always use the `ROUTES` helpers for generating route paths
2. Keep route definitions in `config/routes.ts`
3. Use the `AppRoutes` component for global error handling
4. Group related routes together in the routes configuration
5. Use navigation groups for menus and navigation UI

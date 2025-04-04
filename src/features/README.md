# Feature Structure Guidelines

This document outlines the structure and naming conventions for feature folders in our application, following the feature-sliced architecture principles.

## Improved Feature Structure

After review, we're improving the feature structure to retain atomic design for components while eliminating duplication in API-related code:

### Revised Directory Structure

```
src/features/[feature-name]/
├── api/                  # API operations (GraphQL documents only)
│   └── index.ts          # Export operations from generated GraphQL
├── components/           # UI components specific to the feature
│   ├── atoms/            # Atomic design: basic building blocks
│   │   └── [ComponentName]/
│   │       ├── index.tsx
│   │       └── [component-name].module.scss
│   ├── molecules/        # Atomic design: groups of atoms
│   ├── organisms/        # Atomic design: groups of molecules/atoms
│   ├── templates/        # Page layouts specific to the feature
│   └── index.ts          # Component exports
├── hooks/                # Custom React hooks for the feature
│   ├── use-[hook-name].ts # Individual hook files with kebab-case
│   └── index.ts          # Hook exports
├── lib/                  # Feature-specific utilities
│   ├── helpers/          # Helper functions
│   └── constants/        # Constants and enums
├── mappers/              # All data transformation functions in one place
│   ├── [name].mapper.ts  # Individual mapper files with kebab-case
│   └── index.ts          # Mapper exports
├── pages/                # Page components for the feature
│   └── [PageName]/       # Each page in its own directory
│       ├── index.tsx     # Page component
│       └── [page-name].module.scss # Page-specific styles with kebab-case
├── services/             # All business logic services (including API services)
│   ├── [name].service.ts # Individual service files with kebab-case
│   └── index.ts          # Service exports
├── stores/               # State management
│   ├── [name].store.ts   # Individual store files with kebab-case
│   └── index.ts          # Store exports
├── types/                # All TypeScript types and interfaces
│   ├── api.types.ts      # API-specific types
│   ├── domain.types.ts   # Domain-specific types
│   └── index.ts          # Type exports
└── index.ts              # Public feature API
```

### Key Changes

1. **Retained Atomic Component Structure**:

   - Full atomic design organization is maintained for components
   - Components continue to use their own directories with proper naming

2. **Retained Lib Directory**:

   - Keeps helpers and constants
   - Removed mappers from lib (consolidated in mappers directory)

3. **Consolidated API-Related Code**:

   - API folder simplified to only contain GraphQL operations
   - API types moved to types/api.types.ts
   - API services moved to services directory

4. **Dedicated Mappers Directory**:
   - All mapper functions in one place
   - Clear naming convention with .mapper.ts suffix

This revised structure preserves the detailed organization you prefer while still addressing the duplication issues.

## Naming Conventions

### Folders

- All feature folder names should be **plural** and use **kebab-case** (e.g., `projects`, `repositories`, `user-accounts`)
- Subfolders should use **kebab-case** for multi-word names (e.g., `data-providers`, `form-controls`)

### Files

- **React Components**: Use **PascalCase** for component files when they stand alone

  - Component directories should match component name in **PascalCase**
  - Component files inside their own directory should be named `index.tsx`
  - Style modules should use kebab-case: `[component-name].module.scss`

- **Page Components**:

  - Page directories should use **PascalCase**: `UserProfile/`
  - Page files inside directories should be named `index.tsx`
  - Page style modules should use kebab-case: `user-profile.module.scss`

- **Services, Stores, and Utilities**:

  - Service files: Use kebab-case with `.service.ts` suffix (e.g., `user.service.ts`, `project-crud.service.ts`)
  - Store files: Use kebab-case with `.store.ts` suffix (e.g., `repository.store.ts`, `project-board.store.ts`)
  - Type definition files: Use kebab-case with `.types.ts` suffix (e.g., `domain.types.ts`, `api.types.ts`)
  - Mapper files: Use kebab-case with `.mapper.ts` suffix (e.g., `user.mapper.ts`, `repository.mapper.ts`)

- **Hook Files**:

  - Use kebab-case with the `use-` prefix: `use-[hook-name].ts` (e.g., `use-project-details.ts`, `use-repository-list.ts`)

- **Module Files**:

  - All module files should use kebab-case (e.g., `auth-helpers.ts`, `date-utils.ts`)

- **Index Files**:
  - Use `index.ts` for all barrel exports (re-exporting from a directory)

### Export Patterns

1. **Type Definitions**:

   - All interfaces and types should be defined in the `types/` folder
   - API types in `types/api.types.ts`
   - Domain types in `types/domain.types.ts`
   - Export them via the `types/index.ts` file

2. **Feature Public API**:

   - The root `index.ts` should re-export everything needed by other features
   - Create a named object for the feature (e.g., `Projects`, `Repositories`, `User`)

3. **API Structure**:
   - API folder only contains GraphQL operation exports
   - No types, services, or mappers in the API folder

## Implementation Guidelines

### API Layer

The API folder should focus solely on GraphQL operations:

```typescript
// Example API index.ts
import { GetUserProfileDocument, GetViewerDocument } from "../../../api/generated/graphql";

// Export GraphQL operations
export { GetUserProfileDocument, GetViewerDocument };
```

### Services Layer

Services should:

- Contain all business logic, including API communication
- Be named with `.service.ts` suffix
- Export a singleton instance
- Import and use mappers to transform data

```typescript
// Example service file: user.service.ts
import { executeQuery } from "../../../common/api/client";
import { GetUserProfileDocument } from "../api";
import { mapToUserProfile } from "../mappers";
import { UserProfile, UserApiModel } from "../types";

export class UserService {
  // Implementation...
  async fetchProfile(): Promise<UserProfile | null> {
    const { data } = await executeQuery(GetUserProfileDocument);
    if (data?.viewer) {
      return mapToUserProfile(data.viewer as UserApiModel);
    }
    return null;
  }
}

// Create a singleton instance
export const userService = new UserService();
```

### Mappers Layer

Mappers should:

- Transform data between API and domain models
- Be named with `.mapper.ts` suffix
- Be pure functions without side effects

```typescript
// Example mapper file: user.mapper.ts
import { UserApiModel, UserProfile } from "../types";

export const mapToUserProfile = (apiData: UserApiModel): UserProfile => {
  return {
    login: apiData.login,
    name: apiData.name ?? null,
    avatarUrl: apiData.avatarUrl,
    // other properties...
  };
};
```

### Feature Index File

The main `index.ts` should:

- Re-export all public types, services, mappers, etc.
- Create a named object for the feature

## Implementation Examples

Here are examples of how the revised structure should be implemented:

### API Directory

```typescript
// api/index.ts
import { GetUserProfileDocument, GetViewerDocument } from "../../../api/generated/graphql";

// Export GraphQL operations
export { GetUserProfileDocument, GetViewerDocument };
```

### Services Directory

```typescript
// services/user-profile.service.ts
import { executeQuery } from "../../../common/api/client";
import { GetUserProfileDocument } from "../api";
import { mapToUserProfile } from "../mappers/user-profile.mapper";
import { UserProfile, UserApiModel } from "../types";

export class UserProfileService {
  private userProfile: UserProfile | null = null;

  async fetchProfile(): Promise<UserProfile | null> {
    const { data } = await executeQuery(GetUserProfileDocument);
    if (data?.viewer) {
      return mapToUserProfile(data.viewer as UserApiModel);
    }
    return null;
  }

  // Other methods...
}

// Create a singleton instance
export const userProfileService = new UserProfileService();
```

### Mappers Directory

```typescript
// mappers/user-profile.mapper.ts
import { UserApiModel } from "../types/api.types";
import { UserProfile } from "../types/domain.types";

export const mapToUserProfile = (apiData: UserApiModel): UserProfile => {
  return {
    login: apiData.login,
    name: apiData.name ?? null,
    avatarUrl: apiData.avatarUrl,
    // other properties...
  };
};
```

```typescript
// mappers/index.ts
export * from "./user-profile.mapper";
```

### Hooks Directory

```typescript
// hooks/use-user-profile.ts
import { useState, useEffect } from "react";
import { userProfileService } from "../services/user-profile.service";
import { UserProfile } from "../types";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const data = await userProfileService.fetchProfile();
        if (isMounted) {
          setProfile(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, loading, error };
}
```

```typescript
// hooks/index.ts
export * from "./use-user-profile";
```

### Types Directory

```typescript
// types/api.types.ts
export interface UserApiModel {
  login: string;
  name?: string | null;
  avatarUrl: string;
  bio?: string | null;
  // other API properties...
}
```

```typescript
// types/domain.types.ts
export interface UserProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  // other domain properties...
}
```

```typescript
// types/index.ts
export * from "./api.types";
export * from "./domain.types";
```

### Feature Index File

```typescript
// index.ts
// Re-export all modules
export * from "./types";
export * from "./api";
export * from "./services";
export * from "./mappers";
export * from "./hooks";
export * from "./components";

// Import services for feature object
import { userProfileService } from "./services/user-profile.service";

// Create a feature object for easy imports
export const User = {
  service: userProfileService,
};
```

## Creating a New Feature

When creating a new feature, follow these steps:

1. Create the feature folder with the appropriate name (plural, kebab-case)
2. Set up the folder structure as outlined above
3. Create types in the `types/` folder (both API and domain types)
4. Set up the feature's API layer connecting to backend services
5. Implement mapper functions in the `mappers/` directory
6. Implement services for business logic in the `services/` directory
7. Create stores if needed for state management
8. Build UI components following the atomic design pattern
9. Create the root `index.ts` that exports the public API

Always follow the existing patterns in other features for consistency.

## Feature Dependencies

- Features can depend on `src/common` and `src/core`
- Features can depend on other features, but consider these dependencies carefully
- Avoid circular dependencies between features

## Current Issues and Refactoring Plan

We've identified several inconsistencies in the current feature structure:

1. **Duplicate Functionality**: We found duplicate functionality across different folders:

   - Mappers existing in both `api/mappers/` and `lib/mappers/`
   - Types appearing in both `types/` and `api/types/`
   - Services present in both `services/` and `api/service/`

2. **Proposed Improvements**: Our improved structure keeps the detailed organization you prefer while addressing duplication:

   - Maintain the atomic design component structure
   - Keep the lib directory for helpers and constants
   - Move all mapper functions to a dedicated mappers directory
   - Simplify the API folder to contain only GraphQL operations
   - Move API types to types/api.types.ts
   - Move API services to the services directory

3. **Backward Compatibility**: Until the full migration is complete, maintain backward compatibility through:
   - Compatibility layers in original locations
   - Deprecation notices where appropriate
   - Service adapters bridging old and new structures

### Refactoring Example

Here's an example of how to refactor an existing feature:

#### Before Refactoring (User Feature)

```
src/features/user/
├── api/
│   ├── types/            # API-specific types
│   │   └── index.ts      # Exports UserApiModel
│   ├── service/          # API services
│   │   └── index.ts      # Exports userService
│   ├── mappers/          # Data transformation for API responses
│   │   └── index.ts      # Exports mapToUserProfile
│   └── index.ts          # Re-exports everything from API
├── lib/
│   └── mappers/          # Another location for mappers
│       └── user.mapper.ts # Potentially duplicated mapper
├── types/                # Domain types
│   └── index.ts          # May or may not exist
└── index.ts              # Feature exports
```

#### After Refactoring (User Feature)

```
src/features/user/
├── api/
│   └── index.ts          # Only exports GraphQL operations
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── index.ts
├── lib/
│   ├── helpers/          # Helper functions
│   └── constants/        # Constants and enums
├── mappers/
│   ├── user-profile.mapper.ts  # Consolidated mapper implementation
│   └── index.ts          # Exports all mappers
├── pages/
│   └── UserProfile/      # Example page
│       ├── index.tsx
│       └── user-profile.module.scss  # Kebab-case for styles
├── services/
│   ├── user-profile.service.ts # User API and business logic
│   └── index.ts          # Exports all services
├── types/
│   ├── api.types.ts      # API types (UserApiModel)
│   ├── domain.types.ts   # Domain types (UserProfile)
│   └── index.ts          # Exports all types
└── index.ts              # Feature exports
```

#### Refactoring Steps

1. **Move API Types**:

   - Move `api/types/index.ts` content to `types/api.types.ts`
   - Update imports in all affected files

2. **Consolidate Mappers**:

   - Create `mappers/` directory
   - Move mapper functions from `api/mappers/` and `lib/mappers/` to `mappers/user-profile.mapper.ts`
   - Create `mappers/index.ts` to export all mappers

3. **Move API Services**:

   - Move `api/service/index.ts` content to `services/user-profile.service.ts`
   - Update the service to import from the new locations

4. **Update API Index**:

   - Simplify `api/index.ts` to only export GraphQL operations

5. **Create/Update Feature Types**:

   - Create `types/domain.types.ts` for domain types if needed
   - Ensure `types/index.ts` exports everything from both type files

6. **Update Feature Index**:
   - Update `index.ts` to re-export from the new structure
   - Create the feature object with the consolidated services

## Benefits of the Improved Structure

The improved feature structure offers several key advantages:

1. **Maintained Organization**: Preserves the detailed organization with atomic components and proper folder structure.

2. **Reduced Duplication**: Consolidates duplicated functionality (mappers, types, services) while keeping the organizational structure you prefer.

3. **Clear Responsibilities**: Each directory has a well-defined responsibility.

4. **Consistent Naming Conventions**: Maintains detailed naming conventions for files and directories.

5. **Easier Maintenance**: Makes the codebase easier to maintain by reducing confusion about where functionality should live.

This approach balances preserving the organizational structure you prefer while addressing the duplication issues identified.

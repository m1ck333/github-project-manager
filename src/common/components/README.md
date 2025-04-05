# Components Architecture

This directory contains reusable components organized by their purpose and complexity.

## Component Organization

The components are organized into three main categories:

### 1. UI Components (`ui/`)

Basic UI building blocks that focus on a single responsibility:

- **Typography**: Text components with consistent styling
- **Form**: Form controls and inputs
- **Feedback**: Loading indicators, errors, and toast notifications
- **Modal**: Modal dialogs and overlays
- **Display**: Basic display components

UI components should be small, reusable, and have minimal dependencies.

### 2. Composed Components (`composed/`)

Components that combine multiple UI components to create more complex functionality:

- **Search**: Search input with additional features
- **Grid**: Card and container components for grid layouts
- **BackButton**: Navigation component with special functionality
- **ViewOnGithubLink**: Specialized link component

Composed components can have business logic but should remain reusable across features.

### 3. Layout Components (`layout/`)

Components that handle application layout and structure:

- **Container**: Basic container with padding and width constraints
- **Header**: Application header with navigation
- **PageContainer**: Page wrapper with loading/error states
- **AppInitializer**: Application initialization wrapper
- **ErrorBoundaryRoutes**: Error-handling route wrapper

## Component Organization Guidelines

1. **Atomic Design Principles**: Components follow a simplified atomic design approach
2. **Component Nesting**: Components are organized by complexity and purpose
3. **Style Isolation**: Each component has its own module.scss file
4. **Barrel Exports**: index.ts files are used for clean exports

## Usage Best Practices

1. Prefer UI components for basic functionality
2. Compose more complex components from UI building blocks
3. Use layout components for consistent page structure
4. Use the Stack component for layout management

## Recently Updated Components

### Typography Component

The Typography component has been flattened from:

- `ui/typography/Typography/index.tsx`
- to `ui/Typography/index.tsx`

### Search Component

The Search component has been moved from:

- `ui/search/Search/index.tsx`
- to `composed/Search/index.tsx`

This move better reflects its nature as a composed component rather than a basic UI element.

# Enhanced Project Feature Refactoring

## Summary

We've significantly simplified the project feature by:

1. Breaking down large files into small, focused modules
2. Separating types, actions, and selectors
3. Creating composable components with single responsibilities
4. Simplifying data flow and reducing duplication

## File Structure Changes

### Before (3 large files):

- `project.mapper.ts` (230+ lines) - One large file with all mapping logic
- `project.store.ts` (250+ lines) - Monolithic store with everything together
- `useProject.ts` (190+ lines) - A complex hook handling many concerns

### After (10+ smaller files):

- **Mappers:**

  - `types.ts` - Shared GraphQL response types
  - `project.mapper.ts` - Project-specific mapping only (40 lines)
  - `column.mapper.ts` - Column mapping only (70 lines)
  - `issue.mapper.ts` - Issue mapping only (90 lines)
  - `user.mapper.ts` - User mapping only (10 lines)

- **Store:**

  - `types.ts` - Store interfaces and type definitions
  - `project-actions.ts` - Pure actions for updating state
  - `project-selectors.ts` - Pure selectors for reading state
  - `project.store.ts` - Thin wrapper coordinating actions and selectors

- **Hooks:**
  - `useProject.ts` - Simplified hook focused on project operations

## Benefits

1. **Readability**: Each file is focused on a single aspect, making it easier to understand
2. **Maintainability**: Changes to one aspect don't require touching unrelated code
3. **Testability**: Smaller, focused components are easier to test in isolation
4. **Reusability**: Components can be composed and reused in different contexts

## Example: Column Mapping Logic

### Before (mixed in large file):

```typescript
// In project.mapper.ts (230+ lines)
export function mapProjectColumns(fieldsData?: GithubProjectData["fields"]): Column[] {
  const columns: Column[] = [{ id: "no-status", name: "No Status", type: ColumnType.TODO }];

  if (!fieldsData?.nodes?.length) return columns;

  // 50+ lines of complex logic mixed with other mapping functions
  // ...
}
```

### After (dedicated file):

```typescript
// In column.mapper.ts
export function mapProjectColumns(fieldsData?: GithubFieldsData): Column[] {
  const columns: Column[] = [createDefaultColumn()];

  if (!fieldsData?.nodes?.length) return columns;

  const statusFields = findStatusFields(fieldsData);
  if (!statusFields.length) return columns;

  const statusField = selectStatusField(statusFields);
  if (!statusField || !statusField.options?.length) return columns;

  statusField.options.forEach((option) => {
    if (!option || !option.id || !option.name) return;
    columns.push(createColumnFromOption(option, statusField.id, statusField.name));
  });

  return columns;
}

// With helper functions each with a single responsibility
export function createDefaultColumn(): Column {
  /* ... */
}
export function findStatusFields(fieldsData: GithubFieldsData) {
  /* ... */
}
export function selectStatusField(statusFields: GithubField[]) {
  /* ... */
}
export function createColumnFromOption(option, fieldId, fieldName) {
  /* ... */
}
export function determineColumnType(name: string): ColumnType {
  /* ... */
}
```

## Store Architecture Evolution

### Before:

- Single monolithic class with observable properties, actions, and computed values
- All logic mixed together in one file

### After:

- `ProjectState` interface defines the core state shape
- `ProjectActions` handles all state updates in a pure way
- `ProjectSelectors` extracts data and derived state
- `ProjectStore` composes these together and provides a unified API

## Next Steps

1. Resolve remaining TypeScript issues
2. Add proper tests for each component
3. Apply the same pattern to other areas of the application
4. Consider using modern React patterns like context + reducers as an alternative to MobX

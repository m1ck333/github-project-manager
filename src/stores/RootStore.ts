/**
 * RootStore is the main store that contains all other stores
 *
 * TODO: Refactor to use generated GraphQL hooks directly
 * We should transition from using service classes to using the generated
 * GraphQL hooks directly in our MobX stores. This would provide:
 * - Better type safety (auto-generated types)
 * - Less code maintenance (no need to manually sync with GraphQL schema)
 * - Better React integration
 * - Automatic caching
 *
 * The AppInitializationService should still be used for initial data loading,
 * but mutations should use generated hooks.
 */
export class RootStore {
  // ... existing code ...
}

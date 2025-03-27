/**
 * GraphQL Module Export
 *
 * This is the main entry point for the GraphQL module.
 * It exports the client instance, services, utilities, and generated types.
 */

// Export the GraphQL client
export { client } from "./client";

// Export services
export * from "./services";

// Export utilities
export * from "./utils";

// Export generated types and operations
// Note: These will be properly exported after running codegen
// export * from './generated';

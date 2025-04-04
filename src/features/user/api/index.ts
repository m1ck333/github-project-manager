/**
 * Re-export API-specific functionality for the user feature
 */

// Import from generated GraphQL
import { GetUserProfileDocument, GetViewerDocument } from "@/api-github/generated/graphql";

// Export GraphQL operations
export { GetUserProfileDocument, GetViewerDocument };

// Re-export user service for API-related operations
export { userService } from "../services";

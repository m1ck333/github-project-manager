// Re-export types
export * from "./types";

// Re-export API
export * from "./api";

// Re-export hooks
export * from "./hooks";

// Re-export services
export * from "./services";

// Re-export components
export { default as GitHubTokenWarning } from "./components/GitHubTokenWarning";
export { default as GitHubUserInfo } from "../user/components/GitHubUserInfo";

// Re-export pages
export { default as HomePage } from "./pages/HomePage";

// Import services for app feature object
import { appInitService } from "./services";

// Create app feature object for easy imports
export const App = {
  services: {
    init: appInitService,
  },
};

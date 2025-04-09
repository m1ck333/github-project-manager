// Re-export modules
export * from "./types";
export * from "./api";
export * from "./hooks";
export * from "./stores";

// Import services and stores for user feature object
import { userService } from "./services";
import { userStore } from "./stores";

// Create user feature object for easy imports
export const UserFeature = {
  service: userService,
  store: userStore,
};

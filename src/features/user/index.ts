// Re-export modules
export * from "./types";
export * from "./api";
export * from "./hooks";

// Import services for user feature object
import { userService } from "./services";

// Create user feature object for easy imports
export const User = {
  service: userService,
};

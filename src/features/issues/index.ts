// Re-export all modules
export * from "./types";
export * from "./api";
export * from "./services";
export * from "./components";

// Import services for feature object
import { issueService } from "./services";

// Feature export object
export const Issues = {
  service: issueService,
};

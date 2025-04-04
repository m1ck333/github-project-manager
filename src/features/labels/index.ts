// Re-export all modules
export * from "./types";
export * from "./api";
export * from "./services";
export * from "./components";

// Import services for feature object
import { labelService } from "./services";

// Feature export object
export const Labels = {
  service: labelService,
};

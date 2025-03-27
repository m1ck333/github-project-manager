import { ProjectStore } from "./ProjectStore";
import { RepositoryStore } from "./RepositoryStore";

// Create the store instances
export const projectStore = new ProjectStore();
export const repositoryStore = new RepositoryStore();

// Export the store
export default {
  projectStore,
  repositoryStore,
};

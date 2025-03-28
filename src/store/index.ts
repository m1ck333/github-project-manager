import { ProjectStore } from "./ProjectStore";
import { RepositoryStore } from "./RepositoryStore";
import { UserStore } from "./UserStore";

// Create the store instances
export const projectStore = new ProjectStore();
export const repositoryStore = new RepositoryStore();
export const userStore = new UserStore();

// Export the store
export default {
  projectStore,
  repositoryStore,
  userStore,
};

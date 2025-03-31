import { createContext, useContext } from "react";

import { ProjectStore } from "./ProjectStore";
import { RepositoryStore } from "./RepositoryStore";
import { UserStore } from "./UserStore";

// Create the store instances
export const projectStore = new ProjectStore();
export const repositoryStore = new RepositoryStore();
export const userStore = new UserStore();

// Define a store context type
export interface RootStore {
  projectStore: ProjectStore;
  repositoryStore: RepositoryStore;
  userStore: UserStore;
}

// Create a store context
const storeContext = createContext<RootStore>({
  projectStore,
  repositoryStore,
  userStore,
});

// Create a hook to use the store
export const useStore = () => useContext(storeContext);

// Create a store provider for components
export const StoreProvider = storeContext.Provider;

// Export the store
export default {
  projectStore,
  repositoryStore,
  userStore,
};

import { createContext, useContext } from "react";

import { appInitializationService } from "../services";

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

// Create a root store object
export const rootStore: RootStore = {
  projectStore,
  repositoryStore,
  userStore,
};

// Create a store context with the root store
const storeContext = createContext<RootStore>(rootStore);

// Initialize all stores
export const initializeStores = async (): Promise<void> => {
  try {
    // Initialize all data through the app initialization service
    const data = await appInitializationService.initialize();

    // Update stores with the fetched data
    userStore.setUserProfile(data.user);
    repositoryStore.setRepositories(data.repositories);
    projectStore.setProjects(data.projects);
  } catch (error) {
    console.error("Failed to initialize stores:", error);
  }
};

// Create a hook to use the store
export const useStore = (): RootStore => useContext(storeContext);

// Create a hook to use a specific store
export const useProjectStore = (): ProjectStore => useContext(storeContext).projectStore;
export const useRepositoryStore = (): RepositoryStore => useContext(storeContext).repositoryStore;
export const useUserStore = (): UserStore => useContext(storeContext).userStore;

// Create a store provider for components
export const StoreProvider = storeContext.Provider;

// Export the store
export default rootStore;

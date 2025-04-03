import { createContext, useContext } from "react";

import { Projects } from "../features/projects";
import { ProjectStore as FeatureProjectStore } from "../features/projects/stores";
import { Repositories } from "../features/repositories";
// TODO: Move this import of ProjectStore is only temporary, until refactoring is complete
import { CombinedRepositoryStore } from "../features/repositories/stores";
import { appInitializationService } from "../services";

import { UserStore } from "./user.store";

// Create the store instances
export const projectStore = Projects.store;
export const repositoryStore = Repositories.store;
export const userStore = new UserStore();

// Define a store context type
export interface RootStore {
  projectStore: FeatureProjectStore;
  repositoryStore: CombinedRepositoryStore;
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
    // The stores should now be updated directly by app-init.service
    // repositoryStore and projectStore update happens in the service
  } catch (error) {
    console.error("Failed to initialize stores:", error);
  }
};

// Create a hook to use the store
export const useStore = (): RootStore => useContext(storeContext);

// Create a hook to use a specific store
export const useProjectStore = (): FeatureProjectStore => useContext(storeContext).projectStore;
export const useRepositoryStore = (): CombinedRepositoryStore =>
  useContext(storeContext).repositoryStore;
export const useUserStore = (): UserStore => useContext(storeContext).userStore;

// Create a store provider for components
export const StoreProvider = storeContext.Provider;

// Export the store
export default rootStore;

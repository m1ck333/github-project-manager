import { useState, useEffect, useRef } from "react";

import { appInitializationService } from "../graphql/services";
import { useStore } from "../store";
import { AllAppData } from "../types";

// Track initialization across renders
let globalInitialized = false;

/**
 * Hook to initialize all application data in a single request
 * This loads user profile, repositories, projects, and all related data
 */
export function useAppInitialization() {
  const [loading, setLoading] = useState(!globalInitialized);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(globalInitialized);

  // Use a ref to track initialization state across renders
  const initStartedRef = useRef(false);

  // Get store references
  const { userStore, repositoryStore, projectStore } = useStore();

  // Initialize the application on mount
  useEffect(() => {
    const initialize = async () => {
      if (initialized) return;

      // Set loading state
      setLoading(true);

      try {
        // Only initialize if we have a token
        if (!userStore.hasToken()) {
          setLoading(false);
          return;
        }

        // Fetch initialization data
        const data = await appInitializationService.getAllInitialData();

        // Set repositories and projects in their respective stores
        repositoryStore.setRepositories(data.repositories);
        projectStore.setProjects(data.projects);

        // Set initialized flag
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        setError((error as Error).message);
        setLoading(false);
      }
    };

    initialize();
  }, [initialized, userStore]);

  const retry = () => {
    // Reset both local and global state
    globalInitialized = false;
    initStartedRef.current = false;
    setInitialized(false);
  };

  return {
    loading,
    error,
    initialized,
    retry,
  };
}

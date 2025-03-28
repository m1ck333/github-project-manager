import { useState, useEffect } from "react";

import { projectStore, repositoryStore, userStore } from "../store";

// Track initialization globally to avoid duplicate initialization in strict mode
let globalInitialized = false;

/**
 * Hook for initializing application data
 * Fetches user information, repositories, and projects on app startup
 * and stores them in MobX stores for access throughout the app
 */
export function useAppInitialization() {
  const [isInitializing, setIsInitializing] = useState(!globalInitialized);
  const [isInitialized, setIsInitialized] = useState(globalInitialized);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if already initialized
    if (isInitialized) return;

    const initialize = async () => {
      // If already globally initialized, just update local state
      if (globalInitialized) {
        setIsInitialized(true);
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);
      setError(null);

      try {
        // 1. Fetch user information first
        await userStore.fetchUserProfile(false);

        // 2. Fetch repositories if none are loaded
        if (repositoryStore.repositories.length === 0) {
          await repositoryStore.fetchUserRepositories();
        }

        // 3. Fetch projects if none are loaded
        if (projectStore.projects.length === 0) {
          await projectStore.fetchProjects();
        }

        // Mark as initialized both locally and globally
        setIsInitialized(true);
        globalInitialized = true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error during initialization";
        console.error("Initialization error:", err);
        setError(errorMessage);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [isInitialized]);

  // Retry function resets both local and global initialization state
  const retryInitialization = () => {
    globalInitialized = false;
    setIsInitialized(false);
  };

  return {
    isInitializing,
    isInitialized,
    error,
    retryInitialization,
  };
}

import { useCallback, useEffect, useState } from "react";

import { projectStore } from "@/features/projects";
import { userStore } from "@/features/user/stores";

export const useAppInitialization = () => {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const initializeApp = useCallback(
    async (forceRefresh = false) => {
      if (initializing) return false;

      try {
        setInitializing(true);

        if (!userStore.profile && !userStore.isLoading) {
          await userStore.initialize();
        }

        const success = await projectStore.fetchProjects(forceRefresh);
        if (success) {
          setInitialized(true);
        }
        return success;
      } finally {
        setInitializing(false);
      }
    },
    [initializing]
  );

  useEffect(() => {
    if (!initialized && !initializing) {
      initializeApp(false);
    }
  }, [initialized, initializing, initializeApp]);

  // Only show loading during initial app initialization, not during every project operation
  // Use local state to determine if we're in the initial loading phase
  const loading = initializing || (!initialized && (projectStore.isLoading || userStore.isLoading));

  const error = projectStore.error || userStore.error;

  return {
    loading,
    error,
    initializeApp,
  };
};

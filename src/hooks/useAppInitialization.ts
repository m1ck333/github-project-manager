import { useState, useEffect } from "react";

import { appInitializationService } from "../services";
import { initializeStores } from "../store";

/**
 * Hook to initialize all application data in a single request
 * This loads user profile, repositories, projects, and all related data
 */
export function useAppInitialization() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize the application on mount
  useEffect(() => {
    const initialize = async () => {
      if (initialized) return;

      setLoading(true);
      setError(null);

      try {
        // Initialize all stores via the service
        await initializeStores();

        // If initialization is successful, mark as initialized
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        setError((error as Error).message);
        setLoading(false);
      }
    };

    initialize();
  }, [initialized]);

  const retry = () => {
    setInitialized(false);
  };

  return {
    loading,
    error,
    initialized,
    retry,
  };
}

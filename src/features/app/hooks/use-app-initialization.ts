import { useCallback, useEffect, useState } from "react";

import { useAsync } from "@/common/hooks";
import { getErrorMessage } from "@/common/utils/errors.utils";

import { appInitService } from "../services/app-init.service";

/**
 * Hook for initializing the application data
 * Provides loading state, error handling, and refresh functionality
 */
export const useAppInitialization = () => {
  const { execute, isLoading, error, resetError } = useAsync();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize the app on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Function to initialize the app with optional force refresh
  const initializeApp = useCallback(
    async (forceRefresh = false) => {
      resetError();
      setErrorMessage(null);

      try {
        const initialData = await execute(async () => {
          return await appInitService.initialize(forceRefresh);
        });
        return initialData;
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
        return null;
      }
    },
    [execute, resetError]
  );

  // Clear any initialization errors
  const clearError = useCallback(() => {
    resetError();
    setErrorMessage(null);
  }, [resetError]);

  // Reset the initialization state
  const reset = useCallback(() => {
    appInitService.reset();
    clearError();
  }, [clearError]);

  return {
    loading: isLoading,
    initialized: appInitService.isInitialized,
    error: errorMessage || error,
    data: appInitService.data,
    initializeApp,
    clearError,
    reset,
  };
};

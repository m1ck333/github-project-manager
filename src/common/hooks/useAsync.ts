import { useState } from "react";

import { getErrorMessage } from "../utils/errors";

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsync() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute an async function with automatic loading and error handling
   */
  const execute = async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
    try {
      setIsLoading(true);
      setError(null);
      return await asyncFn();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset the error state
   */
  const resetError = () => setError(null);

  return {
    isLoading,
    error,
    execute,
    resetError,
  };
}

// Add default export
export default useAsync;

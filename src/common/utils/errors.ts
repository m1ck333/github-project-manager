/**
 * Type that represents anything that might be thrown as an error
 */
export type ErrorLike = Error | string | { message?: string } | Record<string, unknown> | unknown;

/**
 * Get error message from any kind of error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  } else if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  } else {
    return String(error);
  }
}

/**
 * Create a new Error object with the specified message
 */
export function createError(message: string): Error {
  return new Error(message);
}

/**
 * Wraps an async function with error handling
 *
 * @param asyncFn A function that returns a Promise
 * @param onError Function to be called if an error occurs
 * @param onLoading Optional function to be called for loading state changes
 * @returns A Promise with the result of the async function
 */
export async function handleAsync<T>(
  asyncFn: () => Promise<T>,
  onError: (message: string) => void,
  onLoading?: (isLoading: boolean) => void
): Promise<T | undefined> {
  try {
    if (onLoading) onLoading(true);
    return await asyncFn();
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    onError(errorMessage);
    return undefined;
  } finally {
    if (onLoading) onLoading(false);
  }
}

/**
 * Creates a function that automatically handles async operations with error handling
 *
 * @param onError Function to be called if an error occurs
 * @param onLoading Optional function to be called for loading state changes
 * @returns A function that wraps async operations with error handling
 */
export function createAsyncHandler(
  onError: (message: string) => void,
  onLoading?: (isLoading: boolean) => void
) {
  return async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
    return handleAsync(asyncFn, onError, onLoading);
  };
}

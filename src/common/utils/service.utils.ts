import { getErrorMessage } from "./errors.utils";

/**
 * Interface for services that manage loading and error states
 */
export interface ILoadingErrorHandler {
  setLoading(isLoading: boolean): void;
  setError(error: Error | null): void;
}

/**
 * Standard response structure for service operations
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: Error;
}

/**
 * Options for service operation execution
 */
export interface ServiceOperationOptions {
  /** Success message to include in the response */
  successMessage?: string;
  /** Custom error prefix to add to error messages */
  errorPrefix?: string;
  /** Custom error message to use instead of the actual error */
  customErrorMessage?: string;
  /** Whether to throw errors instead of returning error result */
  throwOnError?: boolean;
}

/**
 * Executes a service operation with standardized loading state, error handling and result structure
 *
 * @param service - The service instance with loading/error handling capabilities
 * @param operation - The async operation to execute
 * @param options - Configuration options for the operation
 * @returns A standardized result object with success status, data, and messages
 */
export async function executeServiceOperation<T>(
  service: ILoadingErrorHandler,
  operation: () => Promise<T>,
  options?: ServiceOperationOptions
): Promise<ServiceResult<T>> {
  service.setLoading(true);
  service.setError(null);

  try {
    const data = await operation();

    return {
      success: true,
      data,
      message: options?.successMessage,
    };
  } catch (error) {
    let errorMessage: string;

    if (options?.customErrorMessage) {
      errorMessage = options.customErrorMessage;
    } else {
      errorMessage = getErrorMessage(error);
      if (options?.errorPrefix) {
        errorMessage = `${options.errorPrefix}: ${errorMessage}`;
      }
    }

    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    service.setError(errorObj);

    const result = {
      success: false,
      message: errorMessage,
      error: errorObj,
    };

    if (options?.throwOnError) {
      throw errorObj;
    }

    return result;
  } finally {
    service.setLoading(false);
  }
}

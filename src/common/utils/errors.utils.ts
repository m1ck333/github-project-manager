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

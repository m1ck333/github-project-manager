/**
 * Helper function that executes an operation and shows a toast message on success.
 *
 * @param execute - The async executor function from useAsync hook
 * @param showToast - The toast function for showing notifications
 * @param operation - The async operation to execute
 * @param successMessage - Message to show on successful operation
 * @returns The result of the operation or undefined
 */
export async function withToast<T>(
  execute: <R>(asyncFn: () => Promise<R>) => Promise<R | undefined>,
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void,
  operation: () => Promise<T>,
  successMessage: string
): Promise<T | undefined> {
  const result = await execute(operation);
  if (result) showToast(successMessage, "success");
  return result;
}

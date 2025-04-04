import { ZodSchema } from "zod";

/**
 * Validates data against a Zod schema before executing a function
 *
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @param mutationFn The function to execute if validation passes
 * @returns The result of the function, or throws a validation error
 */
export async function validateAndExecute<T, R>(
  schema: ZodSchema<T>,
  data: unknown,
  mutationFn: (validData: T) => Promise<R>
): Promise<R> {
  // Parse and validate the data
  const validationResult = schema.safeParse(data);

  if (!validationResult.success) {
    // Format the validation errors
    const formattedErrors = validationResult.error.format();
    console.error("Validation failed:", formattedErrors);
    throw new Error(JSON.stringify(formattedErrors));
  }

  // If validation passes, execute the function
  return mutationFn(validationResult.data);
}

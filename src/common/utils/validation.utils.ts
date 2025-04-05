import { ZodSchema, ZodError } from "zod";

/**
 * Formats a Zod validation error into a user-friendly object
 */
export interface ValidationError {
  message: string;
  path: string[];
  fields: Record<string, string>;
}

/**
 * Format a Zod error into a structured validation error
 */
export function formatZodError(error: ZodError): ValidationError {
  const fields: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    fields[path] = err.message;
  });

  return {
    message: error.errors[0]?.message || "Validation failed",
    path: error.errors[0]?.path.map((p) => String(p)) || [],
    fields,
  };
}

/**
 * Validates data against a Zod schema
 * Returns the validated data or throws an error
 */
export function validateData<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const validationError = formatZodError(result.error);
    throw new Error(JSON.stringify(validationError));
  }

  return result.data;
}

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
  try {
    // Validate the data
    const validData = validateData(schema, data);

    // Execute the function with validated data
    return await mutationFn(validData);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Validation or execution error:", error.message);
    } else {
      console.error("Unknown error during validation or execution:", error);
    }
    throw error;
  }
}

/**
 * Synchronous version of validateAndExecute
 */
export function validateAndExecuteSync<T, R>(
  schema: ZodSchema<T>,
  data: unknown,
  fn: (validData: T) => R
): R {
  // Validate the data
  const validData = validateData(schema, data);

  // Execute the function with validated data
  return fn(validData);
}

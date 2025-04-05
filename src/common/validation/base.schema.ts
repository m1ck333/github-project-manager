import { z } from "zod";

/**
 * Common schema builders for reuse across the application
 */
export const BaseSchemas = {
  /**
   * Common validation for ID fields
   */
  id: () => z.string().min(1, "ID is required"),

  /**
   * Common validation for name fields
   */
  name: (message: string = "Name is required") => z.string().min(1, message),

  /**
   * Common validation for optional description fields
   */
  description: () => z.string().optional(),

  /**
   * Common validation for URL fields
   */
  url: (message: string = "Valid URL is required") => z.string().url(message).or(z.literal("")),

  /**
   * Common validation for date fields
   */
  date: () =>
    z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),

  /**
   * Common validation for email fields
   */
  email: (message: string = "Valid email is required") =>
    z.string().email(message).or(z.literal("")),

  /**
   * Common validation for arrays with unique items
   */
  uniqueArray: <T>(schema: z.ZodType<T>) =>
    z.array(schema).transform((items) => [...new Set(items)]),

  /**
   * Common validation for user login/username
   */
  username: (message: string = "Username is required") => z.string().min(1, message),

  /**
   * Common validation for visibility types
   */
  visibility: () => z.enum(["PRIVATE", "PUBLIC", "INTERNAL"]).default("PRIVATE"),

  /**
   * Common validation for pagination inputs
   */
  pagination: () =>
    z.object({
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().default(10),
    }),

  /**
   * Common validation for search inputs
   */
  search: () =>
    z.object({
      query: z.string().default(""),
      sortBy: z.string().optional(),
      sortDirection: z.enum(["asc", "desc"]).default("asc"),
    }),
};

/**
 * Factory function to create a form schema with specific fields
 */
export function createFormSchema<T extends z.ZodRawShape>(schema: T) {
  return z.object(schema);
}

/**
 * Type for paginated API responses
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    totalCount: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
    page: z.number(),
    pageSize: z.number(),
  });

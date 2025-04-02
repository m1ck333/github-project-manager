import { z } from "zod";

/**
 * Validation schema for board operations
 */
export const boardSchema = z.object({
  name: z.string().min(1, "Board name is required"),
});

// Type inference from schema
export type BoardSchema = z.infer<typeof boardSchema>;

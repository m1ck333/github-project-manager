import { z } from "zod";

/**
 * Validation schema for project creation and updates
 */
export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

// Type inference from schema
export type ProjectSchema = z.infer<typeof projectSchema>;

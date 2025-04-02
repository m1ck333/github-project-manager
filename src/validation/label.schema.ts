import { z } from "zod";

/**
 * Validation schema for label creation and updates
 */
export const labelSchema = z.object({
  name: z.string().min(1, "Label name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code"),
  description: z.string().optional(),
});

// Type inference from schema
export type LabelSchema = z.infer<typeof labelSchema>;

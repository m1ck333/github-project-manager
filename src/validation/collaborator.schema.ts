import { z } from "zod";

import { CollaboratorRole } from "../types";

/**
 * Validation schema for collaborator operations
 */
export const collaboratorSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(CollaboratorRole),
});

// Type inference from schema
export type CollaboratorSchema = z.infer<typeof collaboratorSchema>;

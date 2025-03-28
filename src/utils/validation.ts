import { z } from "zod";

import { CollaboratorRole } from "../types";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

export const boardSchema = z.object({
  name: z.string().min(1, "Board name is required"),
});

export const labelSchema = z.object({
  name: z.string().min(1, "Label name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code"),
  description: z.string().optional(),
});

export const issueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  labels: z.array(z.string()),
  assignees: z.array(z.string()),
});

export const collaboratorSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(CollaboratorRole),
});

// Export inferred types from Zod schemas
export type ProjectSchema = z.infer<typeof projectSchema>;
export type BoardSchema = z.infer<typeof boardSchema>;
export type LabelSchema = z.infer<typeof labelSchema>;
export type IssueSchema = z.infer<typeof issueSchema>;
export type CollaboratorSchema = z.infer<typeof collaboratorSchema>;

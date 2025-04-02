import { z } from "zod";

/**
 * Validation schema for issue creation and updates
 */
export const issueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  labels: z.array(z.string()),
  assignees: z.array(z.string()),
});

// Type inference from schema
export type IssueSchema = z.infer<typeof issueSchema>;

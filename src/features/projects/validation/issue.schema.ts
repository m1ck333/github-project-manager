import { z } from "zod";

/**
 * Validation schema for issues
 */
export const issueSchema = z.object({
  title: z.string().min(1, "Issue title is required"),
  description: z.string().optional(),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
});

// Type inference from schema
export type IssueSchema = z.infer<typeof issueSchema>;

import { z } from "zod";

import { BaseSchemas, createFormSchema } from "@/common/validation/base.schema";

/**
 * Validation schema for issues
 */
export const issueSchema = createFormSchema({
  title: BaseSchemas.name("Issue title is required"),
  description: BaseSchemas.description(),
  labels: BaseSchemas.uniqueArray(z.string()),
  assignees: BaseSchemas.uniqueArray(z.string()),
});

// Export types
export type IssueFormData = z.infer<typeof issueSchema>;

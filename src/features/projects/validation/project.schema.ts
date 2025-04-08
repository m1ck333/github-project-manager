import { z } from "zod";

import { BaseSchemas, createFormSchema } from "@/common/validation/base.schema";

export const projectSchema = createFormSchema({
  name: BaseSchemas.name("Project name is required"),
  description: BaseSchemas.description(),
});

export const projectSearchSchema = createFormSchema({
  ...BaseSchemas.search().shape,
  labels: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type ProjectSearchParams = z.infer<typeof projectSearchSchema>;

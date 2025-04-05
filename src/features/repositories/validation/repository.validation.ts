import { z } from "zod";

import { BaseSchemas, createFormSchema } from "@/common/validation/base.schema";

/**
 * Repository schema
 */
export const repositorySchema = createFormSchema({
  name: BaseSchemas.name("Repository name is required"),
  description: BaseSchemas.description(),
  visibility: BaseSchemas.visibility(),
});

/**
 * Repository collaborator schema
 */
export const repositoryCollaboratorSchema = createFormSchema({
  username: BaseSchemas.username("Username is required"),
  permission: z.enum(["READ", "TRIAGE", "WRITE", "MAINTAIN", "ADMIN"]).default("READ"),
});

/**
 * Project repository linking schema
 */
export const projectRepositorySchema = createFormSchema({
  repositoryId: BaseSchemas.id(),
  projectId: BaseSchemas.id(),
});

export type RepositoryFormValues = z.infer<typeof repositorySchema>;
export type RepositoryCollaboratorFormValues = z.infer<typeof repositoryCollaboratorSchema>;
export type ProjectRepositoryFormValues = z.infer<typeof projectRepositorySchema>;

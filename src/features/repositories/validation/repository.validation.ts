import * as z from "zod";

/**
 * Repository schema
 */
export const repositorySchema = z.object({
  name: z.string().min(1, "Repository name is required"),
  description: z.string().optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC", "INTERNAL"]).default("PRIVATE"),
});

/**
 * Repository collaborator schema
 */
export const repositoryCollaboratorSchema = z.object({
  username: z.string().min(1, "Username is required"),
  permission: z.enum(["READ", "TRIAGE", "WRITE", "MAINTAIN", "ADMIN"]).default("READ"),
});

/**
 * Project repository linking schema
 */
export const projectRepositorySchema = z.object({
  repositoryId: z.string().min(1, "Repository is required"),
  projectId: z.string().min(1, "Project is required"),
});

export type RepositoryFormValues = z.infer<typeof repositorySchema>;
export type RepositoryCollaboratorFormValues = z.infer<typeof repositoryCollaboratorSchema>;
export type ProjectRepositoryFormValues = z.infer<typeof projectRepositorySchema>;

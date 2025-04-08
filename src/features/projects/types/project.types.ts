import { Collaborator } from "@/features/collaborators/types/collaborator.types";
import { Column } from "@/features/columns/types/column.types";
import { Issue } from "@/features/issues/types/issue.types";
import { Label } from "@/features/labels/types/label.types";
import { Repository } from "@/features/repositories/types/repository";
import type { User } from "@/features/user/types";

import { ProjectFormData, ProjectSearchParams } from "../validation/project.schema";

export interface ProjectState {
  projects: Project[];
  selectedProject: Project | undefined;
  isLoading: boolean;
  error: Error | string | undefined;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  number?: number;
  url?: string;
  html_url?: string;

  owner?: User;
  createdBy?: User;

  repositories?: Repository[];

  columns?: Column[];
  issues?: Issue[];
  collaborators?: Collaborator[];
  labels?: Label[];
}

export type { ProjectFormData, ProjectSearchParams };

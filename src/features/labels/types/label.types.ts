/**
 * Label type for a repository or issue
 */
export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

/**
 * Create label input
 */
export interface CreateLabelInput {
  repositoryId: string;
  name: string;
  color: string;
  description?: string;
}

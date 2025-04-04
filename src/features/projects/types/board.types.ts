/**
 * Column type enum
 */
export enum ColumnType {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  BACKLOG = "BACKLOG",
}

/**
 * Board column type
 */
export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  fieldId: string;
  projectId?: string; // Add optional projectId field
}

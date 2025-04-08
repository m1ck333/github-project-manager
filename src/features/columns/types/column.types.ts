export enum ColumnType {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  BACKLOG = "BACKLOG",
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  fieldId: string;
  projectId?: string;
}

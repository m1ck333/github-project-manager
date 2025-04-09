import { Issue } from "./issue.types";

export interface ColumnIssue extends Issue {
  columnId?: string;
  body?: string;
}

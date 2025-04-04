/**
 * Issue interface
 */
export interface Issue {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: IssueState;
  createdAt: string;
  updatedAt: string;
  labels?: Label[];
}

/**
 * Issue state type
 */
export enum IssueState {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

/**
 * Label interface
 */
export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

import { Label } from "@/features/labels";
import { User } from "@/features/user/types";
export interface Issue {
  id: string;
  number: number;
  title: string;
  state: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  assignees: User[];
  labels: Label[];
}

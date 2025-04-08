import { Label } from "@/features/labels";
import { UserProfile } from "@/features/user";
export interface Issue {
  id: string;
  number: number;
  title: string;
  state: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  assignees: UserProfile[];
  labels: Label[];
}

import { ProjectV2 } from "@/api-github/schema/github-schema";

import { Column, ColumnType } from "../types/column.types";

/**
 * Maps GitHub fields to Column objects
 */
export function mapToColumns(fieldsData?: ProjectV2["fields"]): Column[] {
  if (!fieldsData?.nodes) return [];

  return fieldsData.nodes
    .filter((field): field is NonNullable<typeof field> => field !== null)
    .map((field) => ({
      id: field.id,
      name: field.name,
      type: field.dataType as Column["type"],
      fieldId: field.id,
    }));
}

/**
 * Determine column type based on column name
 */
export function determineColumnType(name: string): ColumnType {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("done") || lowerName.includes("completed")) {
    return ColumnType.DONE;
  } else if (lowerName.includes("progress") || lowerName.includes("doing")) {
    return ColumnType.IN_PROGRESS;
  } else if (lowerName.includes("backlog")) {
    return ColumnType.BACKLOG;
  }
  return ColumnType.TODO;
}

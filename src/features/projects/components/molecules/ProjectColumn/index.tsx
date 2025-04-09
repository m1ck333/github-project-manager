import React from "react";

import { Stack } from "@/common/components/ui/display/Stack";
import IssueColumn from "@/features/issues/components/molecules/IssueColumn";
import { ColumnIssue } from "@/features/issues/types";
import { Column } from "@/features/projects/types";

import styles from "./project-column.module.scss";

interface ProjectColumnProps {
  columns: Column[];
  getIssuesForColumn: (columnId: string) => ColumnIssue[];
  onCreateIssue: (columnId?: string) => void;
  onEditLabels: (issue: ColumnIssue) => void;
  onMoveIssue: (issue: ColumnIssue) => void;
  onDeleteIssue: (issue: ColumnIssue) => void;
}

const ProjectColumn: React.FC<ProjectColumnProps> = ({
  columns,
  getIssuesForColumn,
  onCreateIssue,
  onEditLabels,
  onMoveIssue,
  onDeleteIssue,
}) => {
  return (
    <Stack direction="column" fill className={styles.columnContainer}>
      <div className={styles.scrollArea}>
        <Stack direction="row" spacing={3} className={styles.columnsRow}>
          {columns.map((column) => (
            <div key={column.id} className={styles.columnWrapper}>
              <IssueColumn
                column={column}
                issues={getIssuesForColumn(column.id)}
                onCreateIssue={onCreateIssue}
                onEditLabels={onEditLabels}
                onMoveIssue={onMoveIssue}
                onDeleteIssue={onDeleteIssue}
              />
            </div>
          ))}
        </Stack>
      </div>
    </Stack>
  );
};

export default ProjectColumn;

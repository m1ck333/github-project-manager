import React from "react";
import { FiColumns } from "react-icons/fi";

import { Button } from "@/common/components/ui";
import Stack from "@/common/components/ui/display/Stack";
import IssueCard from "@/features/issues/components/molecules/IssueCard";
import { ColumnIssue } from "@/features/issues/types";
import { ColumnHeader, ColumnFooter } from "@/features/projects/components/atoms";
import { Column } from "@/features/projects/types";

import styles from "./issue-column.module.scss";

interface IssueColumnProps {
  column: Column;
  issues: ColumnIssue[];
  onCreateIssue: (columnId: string) => void;
  onEditLabels: (issue: ColumnIssue) => void;
  onMoveIssue: (issue: ColumnIssue) => void;
  onDeleteIssue: (issue: ColumnIssue) => void;
}

const IssueColumn: React.FC<IssueColumnProps> = ({
  column,
  issues,
  onCreateIssue,
  onEditLabels,
  onMoveIssue,
  onDeleteIssue,
}) => {
  const addIssueButton = (
    <Button
      variant="secondary"
      onClick={() => onCreateIssue(column.id)}
      className={styles.addIssueButton}
    >
      + Add Issue
    </Button>
  );

  return (
    <div className={styles.column}>
      <Stack direction="column" spacing={2}>
        <ColumnHeader
          title={column.name}
          icon={<FiColumns size={18} />}
          actions={addIssueButton}
          className={styles.columnHeader}
        />

        <div className={styles.issuesContainer}>
          {issues.length === 0 ? (
            <ColumnFooter
              onAddItem={() => onCreateIssue(column.id)}
              emptyText="Add issue"
              isEmpty={true}
            />
          ) : (
            <div className={styles.issuesGrid}>
              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onEditLabels={onEditLabels}
                  onMove={onMoveIssue}
                  onDelete={onDeleteIssue}
                />
              ))}
            </div>
          )}
        </div>
      </Stack>
    </div>
  );
};

export default IssueColumn;

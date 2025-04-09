import React from "react";

import { InfoBox } from "@/common/components/ui";
import Stack from "@/common/components/ui/display/Stack";
import Typography from "@/common/components/ui/display/Typography";
import IssueCard from "@/features/issues/components/molecules/IssueCard";
import { ColumnIssue } from "@/features/issues/types";

import styles from "./unassigned-issues.module.scss";

interface UnassignedIssuesProps {
  issues: ColumnIssue[];
  onEditLabels: (issue: ColumnIssue) => void;
  onMoveIssue: (issue: ColumnIssue) => void;
  onDeleteIssue: (issue: ColumnIssue) => void;
}

const UnassignedIssues: React.FC<UnassignedIssuesProps> = ({
  issues,
  onEditLabels,
  onMoveIssue,
  onDeleteIssue,
}) => {
  if (issues.length === 0) {
    return null;
  }

  return (
    <div className={styles.unassignedIssues}>
      <Stack direction="column" spacing={2}>
        <div className={styles.header}>
          <Typography variant="h4">Unassigned Issues</Typography>
          <InfoBox variant="info">
            <Typography variant="body2">
              These issues are not assigned to any column. Use the move action to place them in a
              column.
            </Typography>
          </InfoBox>
        </div>

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
      </Stack>
    </div>
  );
};

export default UnassignedIssues;

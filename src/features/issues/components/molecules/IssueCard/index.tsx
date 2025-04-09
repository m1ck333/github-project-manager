import React from "react";
import { FiTag, FiMove, FiTrash2 } from "react-icons/fi";

import GridCard from "@/common/components/composed/grid/GridCard";
import { ColumnIssue } from "@/features/issues/types";

import styles from "./issue-card.module.scss";

interface IssueCardProps {
  issue: ColumnIssue;
  onEditLabels: (issue: ColumnIssue) => void;
  onMove: (issue: ColumnIssue) => void;
  onDelete: (issue: ColumnIssue) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onEditLabels, onMove, onDelete }) => {
  const issueLabels =
    issue.labels?.map((label) => ({
      icon: <FiTag size={14} />,
      text: (
        <span className={styles.labelText} style={{ backgroundColor: `#${label.color}` }}>
          {label.name}
        </span>
      ),
    })) || [];

  const issueActions = [
    {
      icon: <FiTag size={16} />,
      label: "Edit labels",
      onClick: () => onEditLabels(issue),
    },
    {
      icon: <FiMove size={16} />,
      label: "Move issue",
      onClick: () => onMove(issue),
    },
    {
      icon: <FiTrash2 size={16} />,
      label: "Delete issue",
      onClick: () => onDelete(issue),
    },
  ];

  return (
    <GridCard
      key={issue.id}
      title={issue.title}
      description={issue.body}
      stats={issueLabels.length > 0 ? issueLabels : undefined}
      actions={issueActions}
      className={styles.issueCard}
    />
  );
};

export default IssueCard;

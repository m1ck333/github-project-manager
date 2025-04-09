import React from "react";
import { FiAlertCircle } from "react-icons/fi";

import { Stack } from "@/common/components/ui/display/Stack";
import Typography from "@/common/components/ui/display/Typography";

import styles from "./issue-count.module.scss";

interface IssueCountProps {
  count: number;
  type?: "default" | "warning" | "error" | "success";
  label?: string;
  showIcon?: boolean;
  className?: string;
}

/**
 * Atomic component for displaying issue counts with consistent styling
 */
const IssueCount: React.FC<IssueCountProps> = ({
  count,
  type = "default",
  label,
  showIcon = false,
  className,
}) => {
  const text = label || (count === 1 ? "issue" : "issues");

  return (
    <Stack
      direction="row"
      cross="center"
      spacing={0.5}
      className={`${styles.issueCount} ${styles[type]} ${className || ""}`}
    >
      {showIcon && <FiAlertCircle size={14} className={styles.icon} />}
      <Typography variant="caption" component="span" className={styles.count}>
        {count} {text}
      </Typography>
    </Stack>
  );
};

export default IssueCount;

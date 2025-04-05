import React, { ReactNode } from "react";

import { Stack } from "@/common/components/ui/display";
import Typography from "@/common/components/ui/display/Typography";

import styles from "./empty-state.module.scss";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/**
 * A standardized component for empty states
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <Stack
      direction="column"
      align="center"
      cross="center"
      spacing={2}
      className={`${styles.emptyState} ${className}`}
    >
      {icon && <div className={styles.icon}>{icon}</div>}
      {title && (
        <Typography variant="h3" className={styles.title}>
          {title}
        </Typography>
      )}
      <Typography variant="body2" className={styles.description}>
        {description}
      </Typography>
      {action && <div className={styles.action}>{action}</div>}
    </Stack>
  );
};

export default EmptyState;

import React, { ReactNode } from "react";

import styles from "./EmptyState.module.scss";

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
    <div className={`${styles.emptyState} ${className}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default EmptyState;

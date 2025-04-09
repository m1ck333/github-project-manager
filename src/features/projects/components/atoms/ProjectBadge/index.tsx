import React, { ReactNode } from "react";

import { Stack } from "@/common/components/ui/display/Stack";
import Typography from "@/common/components/ui/display/Typography";

import styles from "./project-badge.module.scss";

interface ProjectBadgeProps {
  label: string;
  icon?: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "small" | "medium";
  className?: string;
}

/**
 * Atomic component for displaying project badges with consistent styling
 */
const ProjectBadge: React.FC<ProjectBadgeProps> = ({
  label,
  icon,
  variant = "default",
  size = "medium",
  className,
}) => {
  return (
    <Stack
      direction="row"
      cross="center"
      spacing={0.5}
      className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className || ""}`}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <Typography variant="caption" component="span" className={styles.label}>
        {label}
      </Typography>
    </Stack>
  );
};

export default ProjectBadge;

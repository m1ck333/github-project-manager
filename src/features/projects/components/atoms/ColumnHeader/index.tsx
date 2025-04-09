import React, { ReactNode } from "react";
import { FiColumns } from "react-icons/fi";

import { Stack } from "@/common/components/ui/display/Stack";
import Typography from "@/common/components/ui/display/Typography";

import styles from "./column-header.module.scss";

interface ColumnHeaderProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Atomic component for column headers with consistent styling
 * Displays a title with optional icon and action buttons
 */
const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  title,
  icon = <FiColumns size={18} />,
  actions,
  className,
}) => {
  return (
    <Stack
      direction="row"
      align="spread"
      cross="center"
      className={`${styles.columnHeader} ${className || ""}`}
    >
      <Stack direction="row" cross="center" spacing={1} className={styles.titleContainer}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <Typography variant="h4" className={styles.title}>
          {title}
        </Typography>
      </Stack>

      {actions && <div className={styles.actions}>{actions}</div>}
    </Stack>
  );
};

export default ColumnHeader;

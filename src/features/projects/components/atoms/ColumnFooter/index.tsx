import React from "react";

import GridCardAdd from "@/common/components/composed/grid/GridCardAdd";
import { Stack } from "@/common/components/ui/display/Stack";
import Typography from "@/common/components/ui/display/Typography";

import styles from "./column-footer.module.scss";

interface ColumnFooterProps {
  onAddItem: () => void;
  emptyText?: string;
  isEmpty?: boolean;
  itemCount?: number;
  className?: string;
}

/**
 * Atomic component for column footers with consistent styling
 * Shows an "Add" button and optional count of items
 */
const ColumnFooter: React.FC<ColumnFooterProps> = ({
  onAddItem,
  emptyText = "Add item",
  isEmpty = true,
  itemCount = 0,
  className,
}) => {
  return (
    <div className={`${styles.columnFooter} ${className || ""}`}>
      {isEmpty ? (
        <GridCardAdd label={emptyText} onClick={onAddItem} size="small" />
      ) : (
        <Stack direction="row" align="spread" cross="center" className={styles.footer}>
          <Typography variant="caption" className={styles.count}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Typography>
          <button onClick={onAddItem} className={styles.addButton}>
            + Add
          </button>
        </Stack>
      )}
    </div>
  );
};

export default ColumnFooter;

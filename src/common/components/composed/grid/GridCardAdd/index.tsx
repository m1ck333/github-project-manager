import React from "react";
import { FiPlus } from "react-icons/fi";

import { Stack } from "@/common/components/ui/display";
import Typography from "@/common/components/ui/display/Typography";

import styles from "./grid-card-add.module.scss";

interface GridCardAddProps {
  label: string;
  onClick: () => void;
  className?: string;
  size?: "default" | "small";
}

const GridCardAdd: React.FC<GridCardAddProps> = ({
  label,
  onClick,
  className,
  size = "default",
}) => {
  return (
    <Stack
      direction="column"
      cross="center"
      align="center"
      className={`${styles.addCard} ${styles[size]} ${className || ""}`}
      onClick={onClick}
    >
      <div className={styles.addIcon}>
        <FiPlus size={size === "small" ? 16 : 24} />
      </div>
      <Typography variant="body1" className={styles.addLabel}>
        {label}
      </Typography>
    </Stack>
  );
};

export default GridCardAdd;

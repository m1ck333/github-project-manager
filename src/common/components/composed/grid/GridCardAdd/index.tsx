import React from "react";
import { FiPlus } from "react-icons/fi";

import styles from "./GridCardAdd.module.scss";

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
    <div className={`${styles.addCard} ${styles[size]} ${className || ""}`} onClick={onClick}>
      <div className={styles.addIcon}>
        <FiPlus size={size === "small" ? 16 : 24} />
      </div>
      <p>{label}</p>
    </div>
  );
};

export default GridCardAdd;

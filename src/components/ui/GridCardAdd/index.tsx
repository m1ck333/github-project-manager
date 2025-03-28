import React from "react";
import { FiPlus } from "react-icons/fi";

import styles from "./GridCardAdd.module.scss";

interface GridCardAddProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const GridCardAdd: React.FC<GridCardAddProps> = ({ label, onClick, className }) => {
  return (
    <div className={`${styles.addCard} ${className || ""}`} onClick={onClick}>
      <div className={styles.addIcon}>
        <FiPlus size={24} />
      </div>
      <p>{label}</p>
    </div>
  );
};

export default GridCardAdd;

import React, { ReactNode } from "react";
import { FiInfo, FiAlertTriangle, FiCheckCircle, FiXCircle } from "react-icons/fi";

import styles from "./InfoBox.module.scss";

export type InfoBoxVariant = "info" | "warning" | "success" | "error";

interface InfoBoxProps {
  variant: InfoBoxVariant;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  variant = "info",
  children,
  className = "",
  icon,
  title,
  dismissible = false,
  onDismiss,
}) => {
  // Default icons based on variant
  const getDefaultIcon = () => {
    switch (variant) {
      case "info":
        return <FiInfo />;
      case "warning":
        return <FiAlertTriangle />;
      case "success":
        return <FiCheckCircle />;
      case "error":
        return <FiXCircle />;
      default:
        return <FiInfo />;
    }
  };

  return (
    <div className={`${styles.infoBox} ${styles[variant]} ${className}`}>
      <div className={styles.iconContainer}>{icon || getDefaultIcon()}</div>
      <div className={styles.content}>
        {title && <h4 className={styles.title}>{title}</h4>}
        <div className={styles.message}>{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button className={styles.closeButton} onClick={onDismiss} aria-label="Dismiss">
          <FiXCircle />
        </button>
      )}
    </div>
  );
};

export default InfoBox;

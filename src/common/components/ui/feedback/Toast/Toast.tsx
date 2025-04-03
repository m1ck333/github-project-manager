import React, { useEffect, useState } from "react";

import styles from "./Toast.module.scss";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Allow time for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Use safer inline styles instead of class names for animations
  const animationStyle = isVisible
    ? { animation: "0.3s ease forwards slide-in" }
    : { animation: "0.3s ease forwards fade-out" };

  return (
    <div className={`${styles.toast} ${styles[type]}`} style={animationStyle}>
      <div className={styles.message}>{message}</div>
      <button
        className={styles.closeButton}
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;

import React, { useEffect, useRef } from "react";

import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "small" | "medium" | "large";
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = "medium" }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Apply size-specific classes
  const sizeClass = {
    small: styles.modalSmall,
    medium: styles.modalMedium,
    large: styles.modalLarge,
  }[size];

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${sizeClass}`} ref={modalRef}>
        <div className={styles.modalHeader}>
          {title && <h2 className={styles.modalTitle}>{title}</h2>}
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;

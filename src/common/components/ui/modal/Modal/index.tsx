import React, { useRef } from "react";

import { useBodyScrollLock, useClickOutside, useEscapeKey } from "@/common/hooks";

import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  size?: "small" | "medium" | "large";
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = "medium" }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Use custom hooks for body scroll locking, escape key handling, and click outside
  useBodyScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);
  useClickOutside(modalRef, onClose, isOpen);

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
          {title && <div className={styles.modalTitle}>{title}</div>}
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

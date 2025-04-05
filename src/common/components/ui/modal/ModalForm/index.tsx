import React, { ReactNode } from "react";

import Modal from "../Modal";

import styles from "./modal-form.module.scss";

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "small" | "medium" | "large";
  className?: string;
}

/**
 * A standardized component for forms in modals
 */
const ModalForm: React.FC<ModalFormProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  className = "",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <div className={`${styles.modalForm} ${className}`}>{children}</div>
    </Modal>
  );
};

export default ModalForm;

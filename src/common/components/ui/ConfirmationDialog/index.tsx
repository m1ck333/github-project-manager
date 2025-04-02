import React, { ReactNode } from "react";

import Modal from "../Modal";

import styles from "./ConfirmationDialog.module.scss";

export interface ConfirmationDialogProps {
  title: string;
  description: ReactNode;
  footer: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  description,
  footer,
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.container}>
        <div className={styles.description}>{description}</div>
        <div className={styles.footer}>{footer}</div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;

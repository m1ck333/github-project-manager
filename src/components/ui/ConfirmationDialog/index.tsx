import React from "react";

import Button from "../Button";

import styles from "./ConfirmationDialog.module.scss";

interface ConfirmationDialogProps {
  title: string;
  message: string;
  warningMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: "primary" | "secondary" | "danger";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  warningMessage,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isSubmitting = false,
  onConfirm,
  onCancel,
  confirmVariant = "danger",
}) => {
  return (
    <div className={styles.confirmationDialog}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <p className={styles.message}>{message}</p>
      {warningMessage && <p className={styles.warning}>{warningMessage}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
        <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : confirmLabel}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

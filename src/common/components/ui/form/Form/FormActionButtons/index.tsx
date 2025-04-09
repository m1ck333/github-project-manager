import React from "react";

import { Button } from "@/common/components/ui";
import { Stack } from "@/common/components/ui/display";

import styles from "./form-action-buttons.module.scss";

export interface FormActionButtonsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  cancelText?: string;
  submitText?: string;
  submittingText?: string;
  className?: string;
}

/**
 * A standardized component for form action buttons (cancel and submit)
 */
export const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitDisabled = false,
  cancelText = "Cancel",
  submitText = "Submit",
  submittingText = "Submitting...",
  className = "",
}) => {
  return (
    <Stack align="end" spacing={2} className={`${styles.formActions} ${className}`}>
      {onCancel && (
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        variant="primary"
        onClick={onSubmit}
        disabled={submitDisabled || isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? submittingText : submitText}
      </Button>
    </Stack>
  );
};

export default FormActionButtons;

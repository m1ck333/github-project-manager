import React from "react";

import { Button } from "@/common/components/ui";
import ConfirmationDialog from "@/common/components/ui/modal/ConfirmationDialog";
import { ColumnIssue } from "@/features/issues/types";

import styles from "./delete-issue-modal.module.scss";

interface DeleteIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue?: ColumnIssue | null;
  onDelete: () => void;
  isDeleting: boolean;
}

export const DeleteIssueModal: React.FC<DeleteIssueModalProps> = ({
  isOpen,
  onClose,
  issue,
  onDelete,
  isDeleting,
}) => {
  return (
    <ConfirmationDialog
      title="Delete Issue"
      description={`Are you sure you want to delete this issue: "${issue?.title}"? This action cannot be undone.`}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className={styles.deleteFooter}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      }
    />
  );
};

export default DeleteIssueModal;

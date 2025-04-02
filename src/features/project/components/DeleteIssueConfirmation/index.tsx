import React from "react";

import Button from "../../../../common/components/ui/Button";
import ConfirmationDialog from "../../../../common/components/ui/ConfirmationDialog";
import { BoardIssue } from "../../../../core/types";

interface DeleteIssueConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  issue: BoardIssue | null;
  isLoading: boolean;
}

const DeleteIssueConfirmation: React.FC<DeleteIssueConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  issue,
  isLoading,
}) => {
  if (!issue) return null;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Issue"
      description={
        <>
          <p>
            Are you sure you want to delete issue <strong>#{issue.number}</strong>:{" "}
            <strong>{issue.title}</strong>?
          </p>
          <p>This action cannot be undone.</p>
        </>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Issue"}
          </Button>
        </>
      }
    />
  );
};

export default DeleteIssueConfirmation;

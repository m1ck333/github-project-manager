import React from "react";

import { Button } from "@/common/components/ui";
import ConfirmationDialog from "@/common/components/ui/modal/ConfirmationDialog";

import styles from "./delete-project-modal.module.scss";

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  projectName,
  onCancel,
  onConfirm,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title="Delete Project"
      description={
        <>
          <p>Are you sure you want to delete project "{projectName}"?</p>
          <p>This action cannot be undone.</p>
        </>
      }
      footer={
        <div className={styles.footerButtons}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      }
      onClose={onCancel}
    />
  );
};

export default DeleteProjectModal;

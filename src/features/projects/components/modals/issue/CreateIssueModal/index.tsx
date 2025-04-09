import React from "react";

import { Modal } from "@/common/components/ui";
import IssueForm from "@/features/issues/components/molecules/IssueForm";

interface IssueFormData {
  title: string;
  body?: string;
  repositoryId?: string;
}

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: IssueFormData) => void;
  isSubmitting: boolean;
  selectedColumn?: string | null;
  error?: string;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  selectedColumn,
  error,
}) => {
  return (
    <Modal title="Create New Issue" isOpen={isOpen} onClose={onClose}>
      <IssueForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        targetColumn={selectedColumn}
        error={error}
        onCancel={onClose}
        simple
      />
    </Modal>
  );
};

export default CreateIssueModal;

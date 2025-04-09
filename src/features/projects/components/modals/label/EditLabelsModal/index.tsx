import React from "react";

import { Modal } from "@/common/components/ui";
import { ColumnIssue } from "@/features/issues/types";
import LabelForm from "@/features/labels/components/molecules/LabelForm";
import { Project } from "@/features/projects/types";

interface EditLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue?: ColumnIssue | null;
  onSubmit: (data: { selectedLabels: string[] }) => void;
  isSubmitting: boolean;
  project: Project;
}

export const EditLabelsModal: React.FC<EditLabelsModalProps> = ({
  isOpen,
  onClose,
  issue,
  onSubmit,
  isSubmitting,
  project,
}) => {
  return (
    <Modal title="Edit Issue Labels" isOpen={isOpen} onClose={onClose}>
      {issue && (
        <LabelForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          labels={project.labels}
          initialSelectedLabels={issue.labels?.map((label) => label.id) || []}
          onCancel={onClose}
          simple
        />
      )}
    </Modal>
  );
};

export default EditLabelsModal;

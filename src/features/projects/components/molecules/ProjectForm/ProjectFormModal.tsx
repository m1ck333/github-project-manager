import React from "react";

import ModalForm from "@/common/components/ui/modal/ModalForm";
import { Project, ProjectFormData } from "@/features/projects/types";

import ProjectForm from "./ProjectForm";

export interface ProjectFormModalProps {
  initialValues?: Project | null;
  onSubmit: (data: ProjectFormData) => Promise<Project | null | undefined>;
  onClose: () => void;
  isOpen: boolean;
  title: string;
  submitLabel: string;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title,
  submitLabel,
}) => {
  const handleSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <ModalForm isOpen={isOpen} onClose={onClose} title={title}>
      <ProjectForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        initialValues={initialValues}
        submitLabel={submitLabel}
      />
    </ModalForm>
  );
};

export default ProjectFormModal;

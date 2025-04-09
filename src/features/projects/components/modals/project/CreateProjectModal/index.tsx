import React from "react";

import { ProjectFormModal } from "@/features/projects/components/molecules/ProjectForm";
import { Project, ProjectFormData } from "@/features/projects/types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<Project | null | undefined>;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  return (
    <ProjectFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Create New Project"
      submitLabel="Create Project"
    />
  );
};

export default CreateProjectModal;

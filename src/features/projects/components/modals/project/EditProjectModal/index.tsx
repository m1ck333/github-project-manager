import React from "react";

import { ProjectFormModal } from "@/features/projects/components/molecules/ProjectForm";
import { Project, ProjectFormData } from "@/features/projects/types";

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<Project | null | undefined>;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onSubmit,
}) => {
  return (
    <ProjectFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialValues={project}
      title="Edit Project"
      submitLabel="Update Project"
    />
  );
};

export default EditProjectModal;

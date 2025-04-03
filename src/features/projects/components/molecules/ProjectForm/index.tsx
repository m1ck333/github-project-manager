import React, { useState } from "react";

import { FormActionButtons, FormGroup, Input, useToast } from "@/common/components/ui";
import { useAsync } from "@/common/hooks";
import { projectStore } from "@/stores";

import { Project, ProjectFormData } from "../../../types";

import styles from "./ProjectForm.module.scss";

interface ProjectFormProps {
  project?: Project; // Optional - if provided, component is in edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSuccess, onCancel }) => {
  const isEditMode = !!project;
  const [name, setName] = useState(project?.name || "");
  const { showToast } = useToast();
  const { isLoading: isSubmitting, error, execute } = useAsync();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    const success = await execute(async () => {
      const projectData: ProjectFormData = {
        name,
        description: project?.description || "",
      };

      if (isEditMode && project) {
        await projectStore.updateProject(project.id, projectData);
        showToast(`Project "${name}" updated successfully`, "success");
      } else {
        await projectStore.createProject(projectData);
        showToast("Project created successfully", "success");
      }

      return true;
    });

    if (success) {
      onSuccess();
    }
  };

  // Extract error message from the error object
  const errorMessage = error ? String(error) : "";

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormGroup label="Project Name" htmlFor="name" error={errorMessage}>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
          disabled={isSubmitting}
          required
        />
      </FormGroup>

      <FormActionButtons
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitDisabled={!name.trim()}
        submitText={isEditMode ? "Update Project" : "Create Project"}
        submittingText={isEditMode ? "Updating..." : "Creating..."}
      />
    </form>
  );
};

export default ProjectForm;

import React, { useState } from "react";

import Input from "@/components/ui/Input";

import { projectStore } from "../../../../store";
import { Project, ProjectFormData } from "../../../../types";
import Button from "../../../ui/Button";
import { useToast } from "../../../ui/Toast";
import styles from "../ProjectList/ProjectList.module.scss";

interface ProjectFormProps {
  project?: Project; // Optional - if provided, component is in edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSuccess, onCancel }) => {
  const isEditMode = !!project;
  const [name, setName] = useState(project?.name || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsSubmitting(true);

    try {
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

      onSuccess();
    } catch (err) {
      const errorMessage =
        (err as Error).message || `Failed to ${isEditMode ? "update" : "create"} project`;
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Project Name"
        id="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter project name"
        disabled={isSubmitting}
        required
        error={error}
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || !name.trim()}>
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Project"
              : "Create Project"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;

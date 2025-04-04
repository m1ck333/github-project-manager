import React, { useState } from "react";

import { Button, FormGroup, Input, Typography } from "@/common/components/ui";
import ModalForm from "@/common/components/ui/modal/ModalForm";
import { Project, ProjectFormData } from "@/features/projects/types";

import styles from "./ProjectForm.module.scss";

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<unknown>;
  onCancel: () => void;
  initialValues?: Project | null;
  isSubmitting?: boolean;
  submitLabel: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isSubmitting = false,
  submitLabel,
}) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      await onSubmit({
        name,
        description,
      });

      // Clear form on success
      setName("");
      setDescription("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className={styles.error}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </div>
      )}

      <FormGroup label="Project Name" htmlFor="project-name">
        <Input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Awesome Project"
          required
        />
      </FormGroup>

      <FormGroup label="Description (optional)" htmlFor="project-description">
        <Input
          id="project-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your project"
        />
      </FormGroup>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<unknown>;
  initialValues?: Project | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalForm isOpen={isOpen} onClose={onClose} title={title}>
      <ProjectForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
      />
    </ModalForm>
  );
};

export default ProjectForm;

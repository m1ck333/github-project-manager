import React, { useState } from "react";
import Button from "../../../ui/Button";
import { useToast } from "../../../ui/Toast";
import { ProjectFormData } from "../../../../types";
import styles from "../ProjectList/ProjectList.module.scss";
import { projectStore } from "../../../../store";
import Input from "@/components/ui/Input";

interface ProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState("");
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
      // Create project with just a name
      const projectData: ProjectFormData = { name, description: "" };
      await projectStore.createProject(projectData);
      showToast("Project created successfully", "success");
      onSuccess();
    } catch (err) {
      const errorMessage = (err as Error).message || "Failed to create project";
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
          {isSubmitting ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;

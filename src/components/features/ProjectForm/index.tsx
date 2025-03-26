import React, { useState } from "react";
import { useToast } from "../../../components/ui/Toast";
import { projectStore } from "../../../store";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import styles from "./ProjectForm.module.scss";

interface ProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await projectStore.createProject(name);
      showToast("Project created successfully", "success");
      onSuccess();
    } catch (error) {
      showToast("Failed to create project", "error");
      if (error instanceof Error) {
        setErrors({ name: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={_isSubmitting}>
          Create Project
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;

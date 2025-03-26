import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { projectStore } from "../../../store";
import styles from "./ProjectForm.module.scss";
import { useToast } from "../../../components/ui/Toast";

interface ProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = observer(({ onSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsSubmitting(true);
      await projectStore.createProject(name, description);
      showToast(`Project "${name}" created successfully`, "success");
      onSuccess?.();
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
      <p className={styles.description}>
        Create a new project to organize your work and collaborate with your team.
      </p>

      <Input
        label="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <Input
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
      />

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={projectStore.loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={projectStore.loading || !name.trim()}>
          {projectStore.loading ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
});

export default ProjectForm;

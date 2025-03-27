import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Project } from "../../../types";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { projectStore } from "../../../store";
import { useToast } from "../../../components/ui/Toast";
import styles from "./ProjectList.module.scss";

interface EditProjectFormProps {
  project: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditProjectForm: React.FC<EditProjectFormProps> = observer(
  ({ project, onSuccess, onCancel }) => {
    const [name, setName] = useState(project.name);
    const [errors, setErrors] = useState<{
      name?: string;
    }>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      try {
        setIsUpdating(true);
        await projectStore.updateProject(project.id, name);
        showToast(`Project "${name}" updated successfully`, "success");
        onSuccess();
      } catch (error) {
        showToast("Failed to update project", "error");
        if (error instanceof Error) {
          setErrors({ name: error.message });
        }
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Project Name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isUpdating}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isUpdating || !name.trim()}>
            {isUpdating ? "Updating..." : "Update Project"}
          </Button>
        </div>
      </form>
    );
  }
);

export default EditProjectForm;

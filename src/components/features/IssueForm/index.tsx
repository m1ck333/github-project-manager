import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { projectStore } from "../../../store";
import { Label } from "../../../types";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { useToast } from "../../../components/ui/Toast";
import styles from "./IssueForm.module.scss";

interface IssueFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const IssueForm: React.FC<IssueFormProps> = observer(({ projectId, onSuccess, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const { showToast } = useToast();

  // Fetch available labels when component mounts
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        // Note: We would need to implement a method to fetch labels
        // This is placeholder code
        // const labels = await projectStore.getLabels(projectId);
        // setAvailableLabels(labels);

        // For now, using mock data
        setAvailableLabels([
          { id: "label1", name: "bug", color: "d73a4a", description: "Something isn't working" },
          {
            id: "label2",
            name: "enhancement",
            color: "a2eeef",
            description: "New feature or request",
          },
          {
            id: "label3",
            name: "documentation",
            color: "0075ca",
            description: "Improvements or additions to documentation",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch labels:", error);
        showToast("Failed to load labels", "error");
      }
    };

    fetchLabels();
  }, [projectId]);

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    if (!title.trim()) {
      setErrors({ ...errors, title: "Title is required" });
      return;
    }

    setIsLoading(true);

    try {
      const issue = await projectStore.createIssue(projectId, title, description, selectedLabels);

      showToast(`Issue "${title}" created successfully`, "success");
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ title: error.message });
        showToast(`Failed to create issue: ${error.message}`, "error");
      } else {
        setErrors({ title: "Failed to create issue" });
        showToast("Failed to create issue", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        error={errors.title}
        required
        placeholder="Issue title"
      />

      <div className={styles.formGroup}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Describe the issue..."
          className={styles.textarea}
        />
        {errors.description && <p className={styles.error}>{errors.description}</p>}
      </div>

      <div className={styles.formGroup}>
        <label>Labels</label>
        <div className={styles.labelsContainer}>
          {availableLabels.map((label) => (
            <div
              key={label.id}
              className={`${styles.labelItem} ${selectedLabels.includes(label.id) ? styles.selected : ""}`}
              onClick={() => toggleLabel(label.id)}
              style={{ backgroundColor: `#${label.color}30` }}
            >
              <span className={styles.labelColor} style={{ backgroundColor: `#${label.color}` }} />
              <span className={styles.labelName}>{label.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading || !title.trim()}>
          {isLoading ? "Creating..." : "Create Issue"}
        </Button>
      </div>
    </form>
  );
});

export default IssueForm;

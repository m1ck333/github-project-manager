import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

import Button from "@/common/components/ui/Button";
import Input from "@/common/components/ui/Input";
import { useToast } from "@/common/components/ui/Toast";
import { projectStore } from "@/stores";

import styles from "./LabelForm.module.scss";

interface LabelFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Default colors for GitHub labels
const defaultColors = [
  "0366d6", // blue
  "28a745", // green
  "d73a4a", // red
  "6f42c1", // purple
  "e4e669", // yellow
  "0075ca", // darker blue
  "a2eeef", // teal
  "f9d0c4", // salmon
  "d4c5f9", // light purple
  "b60205", // dark red
];

const LabelForm: React.FC<LabelFormProps> = observer(({ projectId, onSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColors[0]);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; color?: string }>({});
  const { showToast } = useToast();

  const generateRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * defaultColors.length);
    setColor(defaultColors[randomIndex]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    if (!name.trim()) {
      setErrors({ ...errors, name: "Label name is required" });
      return;
    }

    setIsLoading(true);

    try {
      await projectStore.createLabel(projectId, name, color, description);

      showToast(`Label "${name}" created successfully`, "success");
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ name: error.message });
        showToast(`Failed to create label: ${error.message}`, "error");
      } else {
        setErrors({ name: "Failed to create label" });
        showToast("Failed to create label", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.preview}>
        <div className={styles.labelPreview} style={{ backgroundColor: `#${color}` }}>
          {name || "Label preview"}
        </div>
      </div>

      <Input
        label="Name"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        error={errors.name}
        required
        placeholder="Label name"
      />

      <div className={styles.colorSelector}>
        <label htmlFor="color">Color</label>
        <div className={styles.colorInputGroup}>
          <div className={styles.colorPreview} style={{ backgroundColor: `#${color}` }} />
          <Input
            id="color"
            value={color}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setColor(e.target.value.replace(/^#/, ""))
            }
            error={errors.color}
            placeholder="Color hex (without #)"
            prefix="#"
          />
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={generateRandomColor}
            className={styles.randomButton}
            aria-label="Generate random color"
          >
            <FiRefreshCw />
          </Button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Brief description of this label's purpose"
          className={styles.textarea}
        />
      </div>

      <div className={styles.colorPalette}>
        {defaultColors.map((defaultColor) => (
          <div
            key={defaultColor}
            className={`${styles.colorOption} ${color === defaultColor ? styles.selected : ""}`}
            style={{ backgroundColor: `#${defaultColor}` }}
            onClick={() => setColor(defaultColor)}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading || !name.trim()}>
          {isLoading ? "Creating..." : "Create Label"}
        </Button>
      </div>
    </form>
  );
});

export default LabelForm;

import React, { useState } from "react";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";

import { Button, Typography } from "@/common/components/ui";
import { useToast } from "@/common/components/ui/feedback/Toast";
import { Input } from "@/common/components/ui/form";
import { getErrorMessage } from "@/common/utils/errors.utils";
import { Label } from "@/features/labels/types";

import { labelService } from "../../../services";

import styles from "./label-form.module.scss";

export interface LabelFormProps {
  // Core props
  onSubmit?: (data: { selectedLabels: string[] }) => void;
  onCancel?: () => void;

  // Simple form specific props
  isSubmitting?: boolean;
  labels?: Label[];
  initialSelectedLabels?: string[];
  error?: unknown;

  // Full form specific props
  repositoryId?: string;
  onSuccess?: () => void;

  // Display mode
  simple?: boolean;
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

/**
 * Form component for creating a label or selecting existing labels
 * Has two modes - simple (for label selection) and full (for label creation)
 */
const LabelForm: React.FC<LabelFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  labels = [],
  initialSelectedLabels = [],
  error = null,
  repositoryId,
  onSuccess,
  simple = false,
}) => {
  // State for both modes
  const [isLoading, setIsLoading] = useState(isSubmitting);
  const { showToast } = useToast();

  // State for simple mode (label selection)
  const [selectedLabels, setSelectedLabels] = useState<string[]>(initialSelectedLabels);

  // State for full mode (label creation)
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColors[0]);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; color?: string }>({});

  // Handlers for both modes
  const generateRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * defaultColors.length);
    setColor(defaultColors[randomIndex]);
  };

  // Toggle label selection (simple mode)
  const toggleLabel = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      setSelectedLabels(selectedLabels.filter((id) => id !== labelId));
    } else {
      setSelectedLabels([...selectedLabels, labelId]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple mode - just call the onSubmit with selected labels
    if (simple) {
      if (onSubmit) {
        onSubmit({ selectedLabels });
      }
      return;
    }

    // Full mode - validate and create label
    if (!name.trim()) {
      setErrors({ ...errors, name: "Label name is required" });
      return;
    }

    setIsLoading(true);

    try {
      if (!repositoryId) {
        throw new Error("Repository ID is required");
      }

      await labelService.createLabel(repositoryId, name, color, description);

      showToast(`Label "${name}" created successfully`, "success");
      if (onSuccess) onSuccess();
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

  // Error message for simple mode
  const errorMessage = error ? getErrorMessage(error) : null;

  // Simple version - Label selection form
  if (simple) {
    return (
      <form className={styles.form} onSubmit={handleSubmit}>
        {errorMessage && (
          <div className={styles.formError}>
            <div className={styles.error}>
              <FiAlertCircle size={20} className={styles.icon} />
              <Typography variant="body2" color="error" component="span">
                {errorMessage}
              </Typography>
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <Typography variant="subtitle2">Labels</Typography>
          <div className={styles.labelGrid}>
            {labels.length === 0 ? (
              <Typography variant="body2" className={styles.noLabels}>
                No labels available
              </Typography>
            ) : (
              labels.map((label) => (
                <div
                  key={label.id}
                  className={`${styles.labelItem} ${selectedLabels.includes(label.id) ? styles.selected : ""}`}
                  onClick={() => toggleLabel(label.id)}
                  style={{ backgroundColor: `#${label.color}` }}
                >
                  <Typography variant="body2" component="span" className={styles.labelName}>
                    {label.name}
                  </Typography>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating labels..." : "Update labels"}
          </Button>
        </div>
      </form>
    );
  }

  // Full version - Label creation form
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
};

export default LabelForm;

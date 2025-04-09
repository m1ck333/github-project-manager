import React, { useState, useEffect } from "react";
import { FiAlertCircle } from "react-icons/fi";

import { Button, Typography } from "@/common/components/ui";
import { useToast } from "@/common/components/ui/feedback/Toast";
import { Input } from "@/common/components/ui/form";
import { getErrorMessage } from "@/common/utils/errors.utils";
import { Label } from "@/features/labels/types";

import { issueService } from "../../../services";

import styles from "./issue-form.module.scss";

export interface IssueFormProps {
  // Core props
  onSubmit: (data: { title: string; body?: string; repositoryId?: string }) => void;
  onCancel?: () => void;

  // Simple form specific props
  isSubmitting?: boolean;
  repositories?: { id: string; name: string }[];
  targetColumn?: string | null;
  initialValues?: { title: string; body: string };
  isEditing?: boolean;
  error?: unknown;

  // Full form specific props
  projectId?: string;
  repositoryId?: string;
  onSuccess?: () => void;

  // Display mode
  simple?: boolean;
}

/**
 * Form component for creating or editing an issue
 * Has two modes - simple (for in-place editing) and full (for dedicated form pages)
 */
const IssueForm: React.FC<IssueFormProps> = ({
  // Handle both simple and full props
  onSubmit,
  onCancel,
  isSubmitting = false,
  repositories = [],
  initialValues,
  isEditing = false,
  error = null,
  projectId,
  repositoryId,
  onSuccess,
  simple = false,
}) => {
  // State
  const [title, setTitle] = useState(initialValues?.title || "");
  const [body, setBody] = useState(initialValues?.body || "");
  const [selectedRepoId, setSelectedRepoId] = useState(repositoryId || "");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(isSubmitting);
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const { showToast } = useToast();

  // Effects
  useEffect(() => {
    // Update isLoading when isSubmitting changes
    setIsLoading(isSubmitting);
  }, [isSubmitting]);

  // Set the first repository as default when repositories are loaded
  useEffect(() => {
    if (repositories.length > 0 && !selectedRepoId && !isEditing) {
      setSelectedRepoId(repositories[0].id);
    }
  }, [repositories, selectedRepoId, isEditing]);

  // Only fetch labels in full form mode
  useEffect(() => {
    const fetchLabels = async () => {
      if (simple) return; // Skip for simple form

      try {
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
  }, [projectId, simple, showToast]);

  // Handlers
  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      if (simple) {
        // Simple mode just displays error
        return;
      } else {
        // Full mode manages errors internally
        setErrors({ ...errors, title: "Title is required" });
        return;
      }
    }

    if (simple) {
      // Simple mode directly calls the provided onSubmit
      onSubmit({
        title,
        body,
        repositoryId: selectedRepoId,
      });
      return;
    }

    // Full mode handles its own API call
    setIsLoading(true);

    try {
      // Create the issue
      await issueService.createIssue(selectedRepoId || repositoryId || "", title, body);

      showToast(`Issue "${title}" created successfully`, "success");
      if (onSuccess) onSuccess();
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

  // Convert error to string if it exists (for simple mode)
  const errorMessage = error ? getErrorMessage(error) : null;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Error display for simple mode */}
      {simple && errorMessage && (
        <div className={styles.formError}>
          <div className={styles.error}>
            <FiAlertCircle size={20} className={styles.icon} />
            <Typography variant="body2" color="error" component="span">
              {errorMessage}
            </Typography>
          </div>
        </div>
      )}

      {/* Repository selection - only for non-editing and when repositories are available */}
      {!isEditing && repositories.length > 0 && (
        <div className={styles.formGroup}>
          <label htmlFor="repository">
            <Typography variant="subtitle2">Repository</Typography>
          </label>
          <select
            id="repository"
            className={styles.select}
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            required
          >
            <option value="">Select a repository</option>
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Title field */}
      {simple ? (
        <div className={styles.formGroup}>
          <label htmlFor="issue-title">
            <Typography variant="subtitle2">Issue Title</Typography>
          </label>
          <input
            id="issue-title"
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Fix login button"
            required
          />
        </div>
      ) : (
        <Input
          label="Title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          error={errors.title}
          required
          placeholder="Issue title"
        />
      )}

      {/* Description field */}
      {simple ? (
        <div className={styles.formGroup}>
          <label htmlFor="issue-body">
            <Typography variant="subtitle2">Description</Typography>
          </label>
          <textarea
            id="issue-body"
            className={styles.input}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={4}
          />
        </div>
      ) : (
        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Describe the issue..."
            className={styles.textarea}
          />
          {errors.title && <p className={styles.error}>{errors.title}</p>}
        </div>
      )}

      {/* Labels section - only for full form */}
      {!simple && (
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
                <span
                  className={styles.labelColor}
                  style={{ backgroundColor: `#${label.color}` }}
                />
                <span className={styles.labelName}>{label.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            !title.trim() ||
            (!isEditing && !selectedRepoId && repositories.length > 0) ||
            isLoading ||
            isSubmitting
          }
        >
          {isLoading || isSubmitting
            ? isEditing
              ? "Updating Issue..."
              : "Creating Issue..."
            : isEditing
              ? "Update Issue"
              : "Create Issue"}
        </Button>
      </div>
    </form>
  );
};

export default IssueForm;

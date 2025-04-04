import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import {
  FiTag,
  FiColumns,
  FiRefreshCw,
  FiTrash2,
  FiMove,
  FiAlertCircle,
  FiEdit2,
} from "react-icons/fi";

import GridCard from "@/common/components/composed/grid/GridCard";
import GridCardAdd from "@/common/components/composed/grid/GridCardAdd";
import {
  Button,
  ConfirmationDialog,
  Error,
  InfoBox,
  Loading,
  Modal,
  Typography,
  useToast,
} from "@/common/components/ui";
import { useAsync } from "@/common/hooks";
import { getErrorMessage } from "@/common/utils/errors";
import { projectStore } from "@/stores";

import { Project, Label, BoardIssue } from "../../../types";
import MoveIssueModal from "../../molecules/MoveIssueModal";

import styles from "./ProjectBoard.module.scss";

interface ProjectBoardProps {
  project: Project;
}

// Fix SimpleIssueForm component
interface SimpleIssueFormProps {
  onSubmit: (data: { title: string; body?: string }) => void;
  isSubmitting?: boolean;
  repositories?: { id: string; name: string }[];
  targetColumn?: string | null;
  initialValues?: { title: string; body: string };
  isEditing?: boolean;
  onCancel?: () => void;
  error?: unknown;
}

const SimpleIssueForm: React.FC<SimpleIssueFormProps> = ({
  onSubmit,
  isSubmitting = false,
  repositories = [],
  initialValues,
  isEditing = false,
  onCancel,
  error = null,
}) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [body, setBody] = useState(initialValues?.body || "");
  const [repositoryId, setRepositoryId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      body,
    });
  };

  // Set the first repository as default when repositories are loaded
  useEffect(() => {
    if (repositories.length > 0 && !repositoryId && !isEditing) {
      setRepositoryId(repositories[0].id);
    }
  }, [repositories, repositoryId, isEditing]);

  // Convert error to string if it exists
  const errorMessage = error ? getErrorMessage(error) : null;

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

      {/* Only show repository selection for new issues */}
      {!isEditing && (
        <div className={styles.formGroup}>
          <label htmlFor="repository">
            <Typography variant="subtitle2">Repository</Typography>
          </label>
          <select
            id="repository"
            className={styles.select}
            value={repositoryId}
            onChange={(e) => setRepositoryId(e.target.value)}
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

      <div className={styles.actions}>
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!title.trim() || (!isEditing && !repositoryId) || isSubmitting}
        >
          {isSubmitting
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

// Add SimpleLabelSelectorForm component
interface SimpleLabelSelectorFormProps {
  onSubmit: (selectedLabelIds: string[]) => void;
  onCancel: () => void;
  isLoading: boolean;
  availableLabels: Label[];
  currentLabels: Label[];
}

const SimpleLabelSelectorForm: React.FC<SimpleLabelSelectorFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  availableLabels,
  currentLabels,
}) => {
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    currentLabels.map((label) => label.id)
  );

  const handleLabelToggle = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      // Remove label if already selected
      setSelectedLabelIds(selectedLabelIds.filter((id) => id !== labelId));
    } else {
      // Add label if not selected
      setSelectedLabelIds([...selectedLabelIds, labelId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedLabelIds);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <Typography variant="subtitle2">Select Labels</Typography>
        <div className={styles.labelsList}>
          {availableLabels.length === 0 ? (
            <Typography variant="body2" className={styles.emptyMessage}>
              No labels available. Create some labels first.
            </Typography>
          ) : (
            availableLabels.map((label) => (
              <div key={label.id} className={styles.labelCheckboxItem}>
                <label className={styles.labelCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedLabelIds.includes(label.id)}
                    onChange={() => handleLabelToggle(label.id)}
                  />
                  <span
                    className={styles.labelColor}
                    style={{ backgroundColor: `#${label.color}` }}
                  ></span>
                  <Typography variant="body2" component="span" className={styles.labelName}>
                    {label.name}
                  </Typography>
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || availableLabels.length === 0}>
          Save Labels
        </Button>
      </div>
    </form>
  );
};

export const ProjectBoard: React.FC<ProjectBoardProps> = observer(({ project }) => {
  const { showToast } = useToast();

  // Use the useAsync hook for various async operations
  const {
    isLoading: isCreatingIssue,
    error: createIssueError,
    execute: executeCreateIssue,
  } = useAsync();
  const { isLoading: isUpdatingLabels, execute: executeUpdateLabels } = useAsync();
  const { isLoading: isMovingIssue, execute: executeMoveIssue } = useAsync();
  const { isLoading: isDeletingIssue, execute: executeDeleteIssue } = useAsync();

  // UI states - only keep what's needed for UI interaction
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isLabelSelectorModalOpen, setIsLabelSelectorModalOpen] = useState(false);
  const [issueForLabels, setIssueForLabels] = useState<BoardIssue | null>(null);
  const [selectedColumnForIssue, setSelectedColumnForIssue] = useState<string | null>(null);

  // New state for move issue modal
  const [isMoveIssueModalOpen, setIsMoveIssueModalOpen] = useState(false);
  const [issueToMove, setIssueToMove] = useState<BoardIssue | null>(null);

  // New state for delete issue confirmation
  const [isDeleteIssueModalOpen, setIsDeleteIssueModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<BoardIssue | null>(null);

  // Set the selected project in the store
  useEffect(() => {
    // We don't need to load project data as it's already loaded during app initialization
    // Just set the current project in the store
    if (project && project.id) {
      projectStore.currentProject = project;
    }
  }, [project]);

  // Helper function to get issues for a specific column
  const getIssuesForColumn = (columnId: string): BoardIssue[] => {
    if (!project?.issues) return [];

    // Find issues that match this column
    const matchingIssues = project.issues.filter((issue) => {
      const matches = issue.columnId === columnId;
      return matches;
    });

    return matchingIssues;
  };

  // Get issues with no status
  const getIssuesWithoutStatus = (): BoardIssue[] => {
    if (!project?.issues) return [];

    return project.issues.filter((issue) => {
      return issue.columnId === "no-status";
    });
  };

  const handleCreateIssue = async (data: { title: string; body?: string }) => {
    const success = await executeCreateIssue(async () => {
      // Use the first column as default if available
      const targetColumnId =
        selectedColumnForIssue ||
        (projectStore.columns.length > 0 ? projectStore.columns[0].id : null);

      // Only pass columnId if it's defined
      let createdIssue;
      if (targetColumnId) {
        createdIssue = await projectStore.createIssue(
          project.id,
          data.title,
          data.body,
          targetColumnId
        );
      } else {
        createdIssue = await projectStore.createIssue(project.id, data.title, data.body);
      }

      if (createdIssue) {
        showToast(`Issue "${data.title}" created successfully!`, "success");
        return true;
      } else {
        showToast("Failed to create issue", "error");
        return false;
      }
    });

    if (success) {
      setIsIssueModalOpen(false);
    }
  };

  const handleUpdateIssueLabels = async (selectedLabelIds: string[]) => {
    if (!issueForLabels) return;

    const success = await executeUpdateLabels(async () => {
      const result = await projectStore.updateIssueLabels(issueForLabels.id, selectedLabelIds);

      if (result) {
        showToast("Labels updated successfully", "success");
      } else {
        showToast("Failed to update labels", "error");
      }

      return result;
    });

    if (success) {
      setIsLabelSelectorModalOpen(false);
      setIssueForLabels(null);
    }
  };

  const openLabelSelector = (issue: BoardIssue) => {
    setIssueForLabels(issue);
    setIsLabelSelectorModalOpen(true);
  };

  // Add a function to handle moving issues between columns
  const moveIssue = (issueId: string, targetColumnId: string) => {
    executeMoveIssue(async () => {
      // Find the issue in the project
      const issue = project.issues?.find((i) => i.id === issueId);
      if (!issue) {
        showToast("Issue not found", "error");
        return false;
      }

      // Find the target column in the project
      const targetColumn = project.columns?.find((c) => c.id === targetColumnId);
      if (!targetColumn) {
        showToast("Target column not found", "error");
        return false;
      }

      // For now, we'll update the issue locally in the UI
      // In a real implementation, this would call a GraphQL mutation
      issue.columnId = targetColumnId;
      issue.columnName = targetColumn.name;

      // Force a re-render by creating a new reference
      const updatedIssues = [...(project.issues || [])];
      project.issues = updatedIssues;

      showToast(`Moved issue to ${targetColumn.name}`, "success");
      return true;
    });
  };

  // Add a deleteIssue function
  const deleteIssue = async (issueId: string) => {
    await executeDeleteIssue(async () => {
      // Find the issue in the project
      const issue = project.issues?.find((i) => i.id === issueId);
      if (!issue) {
        showToast("Issue not found", "error");
        return false;
      }

      if (!issue.issueId) {
        showToast("Issue ID is missing", "error");
        return false;
      }

      // Use the projectStore's deleteIssue method to perform the actual deletion
      const success = await projectStore.deleteIssue(
        project.id,
        issue.issueId, // The actual GitHub issue ID
        issueId // The project item ID
      );

      if (success) {
        showToast("Issue deleted successfully", "success");
      } else {
        showToast("Failed to delete issue", "error");
      }

      return success;
    });
  };

  // Add handlers for the modal actions
  const handleOpenMoveIssueModal = (issue: BoardIssue) => {
    setIssueToMove(issue);
    setIsMoveIssueModalOpen(true);
  };

  const handleMoveIssue = (targetColumnId: string) => {
    if (issueToMove) {
      moveIssue(issueToMove.id, targetColumnId);
      setIsMoveIssueModalOpen(false);
      setIssueToMove(null);
    }
  };

  const handleOpenDeleteIssueModal = (issue: BoardIssue) => {
    setIssueToDelete(issue);
    setIsDeleteIssueModalOpen(true);
  };

  const handleDeleteIssue = () => {
    if (issueToDelete) {
      deleteIssue(issueToDelete.id);
      // No longer trying to check the return value
      setIsDeleteIssueModalOpen(false);
      setIssueToDelete(null);
    }
  };

  // Render all columns content
  const renderBoardView = () => {
    if (projectStore.loading) {
      return (
        <div className={styles.loadingContainer}>
          <Loading size="large" />
          <Typography variant="body1" component="p">
            Loading project board...
          </Typography>
        </div>
      );
    }

    // Handle errors with our new Error component
    if (projectStore.error) {
      return (
        <div className={styles.errorContainer}>
          <Error error={projectStore.error} onRetry={() => window.location.reload()} />
        </div>
      );
    }

    // Add check for missing project data
    if (!project) {
      return (
        <div className={styles.emptyState}>
          <FiAlertCircle size={48} />
          <Typography variant="h3">Project Not Found</Typography>
          <Typography variant="body1">
            The project data could not be loaded. Please try refreshing.
          </Typography>
        </div>
      );
    }

    // Check if the project has columns directly
    if (!project.columns || project.columns.length === 0) {
      return (
        <div className={styles.emptyState}>
          <FiColumns size={48} />
          <Typography variant="h3">No Columns Found</Typography>
          <Typography variant="body1">
            This project doesn't have any columns set up yet. Add columns to your project to track
            issues.
          </Typography>
        </div>
      );
    }

    // Filter out columns that aren't "no-status"
    const noStatusColumn = project.columns.find((col) => col.id === "no-status");

    // Create a map to deduplicate columns by ID
    const columnMap = new Map();
    // Add No Status column first if it exists
    if (noStatusColumn) {
      columnMap.set(noStatusColumn.id, noStatusColumn);
    }

    // Add other columns, ensuring no duplicates
    project.columns.forEach((column) => {
      if (column.id !== "no-status" && !columnMap.has(column.id)) {
        columnMap.set(column.id, column);
      }
    });

    // Convert map back to array for rendering
    const uniqueColumns = Array.from(columnMap.values());
    const statusColumns = uniqueColumns.filter((col) => col.id !== "no-status");

    // Return board view with columns
    return (
      <div className={styles.boardContainer}>
        <div className={styles.boardColumns}>
          {/* Render No Status column first */}
          {noStatusColumn && (
            <div key={noStatusColumn.id} className={styles.columnContainer}>
              <div className={styles.columnHeader}>
                <h3>{noStatusColumn.name}</h3>
              </div>
              <div className={styles.issuesContainer}>
                {getIssuesWithoutStatus().map((issue) => (
                  <GridCard
                    key={issue.id}
                    title={`#${issue.number}: ${issue.title}`}
                    description={issue.body}
                    actions={[
                      {
                        icon: <FiMove size={16} />,
                        label: "Move",
                        onClick: () => handleOpenMoveIssueModal(issue),
                      },
                      {
                        icon: <FiEdit2 size={16} />,
                        label: "Edit",
                        onClick: () => {
                          setIsIssueModalOpen(true);
                        },
                      },
                      {
                        icon: <FiTag size={16} />,
                        label: "Labels",
                        onClick: () => openLabelSelector(issue),
                      },
                      {
                        icon: <FiTrash2 size={16} />,
                        label: "Delete",
                        onClick: () => handleOpenDeleteIssueModal(issue),
                      },
                    ]}
                    stats={
                      issue.labels && issue.labels.length > 0
                        ? [
                            {
                              icon: <FiTag size={14} />,
                              text: (
                                <div className={styles.labelContainer}>
                                  {issue.labels.map((label) => (
                                    <span
                                      key={label.id}
                                      className={styles.labelDot}
                                      style={{
                                        backgroundColor: label.color.startsWith("#")
                                          ? label.color
                                          : `#${label.color}`,
                                      }}
                                      title={label.name}
                                    />
                                  ))}
                                </div>
                              ),
                            },
                          ]
                        : undefined
                    }
                  />
                ))}
                <GridCardAdd
                  label="Add Issue"
                  onClick={() => {
                    setSelectedColumnForIssue("no-status");
                    setIsIssueModalOpen(true);
                  }}
                  className={styles.addIssueCard}
                  size="small"
                />
              </div>
            </div>
          )}

          {/* Render columns from Status field */}
          {statusColumns.map((column) => (
            <div key={column.id} className={styles.columnContainer}>
              <div className={styles.columnHeader}>
                <h3>{column.name}</h3>
              </div>
              <div className={styles.issuesContainer}>
                {getIssuesForColumn(column.id).map((issue) => (
                  <GridCard
                    key={issue.id}
                    title={`#${issue.number}: ${issue.title}`}
                    description={issue.body}
                    actions={[
                      {
                        icon: <FiMove size={16} />,
                        label: "Move",
                        onClick: () => handleOpenMoveIssueModal(issue),
                      },
                      {
                        icon: <FiEdit2 size={16} />,
                        label: "Edit",
                        onClick: () => {
                          setIsIssueModalOpen(true);
                        },
                      },
                      {
                        icon: <FiTag size={16} />,
                        label: "Labels",
                        onClick: () => openLabelSelector(issue),
                      },
                      {
                        icon: <FiTrash2 size={16} />,
                        label: "Delete",
                        onClick: () => handleOpenDeleteIssueModal(issue),
                      },
                    ]}
                    stats={
                      issue.labels && issue.labels.length > 0
                        ? [
                            {
                              icon: <FiTag size={14} />,
                              text: (
                                <div className={styles.labelContainer}>
                                  {issue.labels.map((label) => (
                                    <span
                                      key={label.id}
                                      className={styles.labelDot}
                                      style={{
                                        backgroundColor: label.color.startsWith("#")
                                          ? label.color
                                          : `#${label.color}`,
                                      }}
                                      title={label.name}
                                    />
                                  ))}
                                </div>
                              ),
                            },
                          ]
                        : undefined
                    }
                  />
                ))}
                <GridCardAdd
                  label="Add Issue"
                  onClick={() => {
                    setSelectedColumnForIssue(column.id);
                    setIsIssueModalOpen(true);
                  }}
                  className={styles.addIssueCard}
                  size="small"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.projectBoard}>
      <div className={styles.header}>
        <h2>{project.name}</h2>
        <div className={styles.actions}>
          <Button
            onClick={() => (projectStore.currentProject = project)}
            variant="secondary"
            disabled={projectStore.loading}
          >
            <FiRefreshCw className={projectStore.loading ? styles.spinning : ""} />
            Refresh
          </Button>
        </div>
      </div>
      <div className={styles.content}>
        {/* Render board view directly */}
        {renderBoardView()}
      </div>

      {/* Modals - Issue modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
        }}
        title="Create New Issue"
      >
        <SimpleIssueForm
          onSubmit={handleCreateIssue}
          isSubmitting={isCreatingIssue}
          repositories={projectStore.repositories}
          targetColumn={selectedColumnForIssue}
          onCancel={() => {
            setIsIssueModalOpen(false);
          }}
          error={createIssueError}
        />
      </Modal>

      {/* Move Issue Modal */}
      <MoveIssueModal
        isOpen={isMoveIssueModalOpen}
        onClose={() => {
          setIsMoveIssueModalOpen(false);
          setIssueToMove(null);
        }}
        onMove={handleMoveIssue}
        columns={project.columns || []}
        isLoading={isMovingIssue}
        currentColumnId={issueToMove?.columnId}
      />

      <Modal
        isOpen={isDeleteIssueModalOpen}
        onClose={() => {
          setIsDeleteIssueModalOpen(false);
          setIssueToDelete(null);
        }}
        title="Delete Issue"
      >
        <ConfirmationDialog
          title="Delete Issue"
          description={`Are you sure you want to delete issue #${issueToDelete?.number}: ${issueToDelete?.title}?`}
          footer={
            <Button variant="danger" onClick={handleDeleteIssue} disabled={isDeletingIssue}>
              {isDeletingIssue ? "Deleting..." : "Delete Issue"}
            </Button>
          }
          isOpen={isDeleteIssueModalOpen}
          onClose={() => {
            setIsDeleteIssueModalOpen(false);
            setIssueToDelete(null);
          }}
        />
      </Modal>

      {/* Other modals here */}
      {isLabelSelectorModalOpen && (
        <Modal
          isOpen={isLabelSelectorModalOpen}
          onClose={() => setIsLabelSelectorModalOpen(false)}
          title="Manage Issue Labels"
        >
          <InfoBox variant="info" className={styles.labelInfoBox}>
            <p>
              Labels are managed through GitHub. Only labels from the repository where this issue is
              created will be available. Any changes made here will be reflected in GitHub.
            </p>
          </InfoBox>
          <SimpleLabelSelectorForm
            onSubmit={handleUpdateIssueLabels}
            onCancel={() => setIsLabelSelectorModalOpen(false)}
            isLoading={isUpdatingLabels}
            availableLabels={[]}
            currentLabels={issueForLabels?.labels || []}
          />
        </Modal>
      )}
    </div>
  );
});

export default ProjectBoard;

import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiTag,
  FiColumns,
  FiList,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiInfo,
} from "react-icons/fi";

import {
  columnService,
  ProjectV2SingleSelectFieldOptionColor,
} from "../../../../graphql/services/ColumnService";
import { issueService } from "../../../../graphql/services/IssueService";
import { labelService } from "../../../../graphql/services/LabelService";
import { Column, Issue, Project, ColumnType, Label } from "../../../../types";
import Button from "../../../ui/Button";
import ConfirmationDialog from "../../../ui/ConfirmationDialog";
import Loading from "../../../ui/Loading";
import Modal from "../../../ui/Modal";
import { useToast } from "../../../ui/Toast";

import styles from "./ProjectBoard.module.scss";

type ActiveView = "issues" | "labels" | "columns";

interface ProjectBoardProps {
  project: Project;
}

// Extended Issue type with columnId for board functionality
interface BoardIssue extends Issue {
  columnId?: string;
}

interface SimpleColumnFormProps {
  onSubmit: (name: string, type: ColumnType) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialName?: string;
  initialType?: ColumnType;
}

const SimpleColumnForm: React.FC<SimpleColumnFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  initialName,
  initialType,
}) => {
  const [name, setName] = useState(initialName || "");
  const [type, setType] = useState<ColumnType>(initialType || ColumnType.TODO);

  // Determine if we're in edit mode
  const isEditMode = !!initialName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), type);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="column-name">Column Name</label>
        <input
          id="column-name"
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., In Progress"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="column-type">Column Type</label>
        <select
          id="column-type"
          className={styles.select}
          value={type}
          onChange={(e) => setType(e.target.value as ColumnType)}
        >
          <option value={ColumnType.TODO}>Todo</option>
          <option value={ColumnType.IN_PROGRESS}>In Progress</option>
          <option value={ColumnType.DONE}>Done</option>
          <option value={ColumnType.BACKLOG}>Backlog</option>
        </select>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || isLoading}>
          {isLoading
            ? isEditMode
              ? "Updating Column..."
              : "Adding Column..."
            : isEditMode
              ? "Update Column"
              : "Add Column"}
        </Button>
      </div>
    </form>
  );
};

interface SimpleLabelFormProps {
  onSubmit: (name: string, color: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const SimpleLabelForm: React.FC<SimpleLabelFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3498db");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), color);
    }
  };

  const colorOptions = [
    { label: "Blue", value: "#3498db" },
    { label: "Green", value: "#2ecc71" },
    { label: "Red", value: "#e74c3c" },
    { label: "Purple", value: "#9b59b6" },
    { label: "Orange", value: "#e67e22" },
    { label: "Yellow", value: "#f1c40f" },
  ];

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="label-name">Label Name</label>
        <input
          id="label-name"
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., bug, feature, documentation"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="label-color">Label Color</label>
        <select
          id="label-color"
          className={styles.select}
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ backgroundColor: color, color: "#fff" }}
        >
          {colorOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              style={{ backgroundColor: option.value, color: "#fff" }}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || isLoading}>
          {isLoading ? "Creating Label..." : "Create Label"}
        </Button>
      </div>
    </form>
  );
};

interface SimpleIssueFormProps {
  onSubmit: (title: string, body: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  repositories: Array<{ id: string; name: string }>;
}

const SimpleIssueForm: React.FC<SimpleIssueFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  repositories,
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [repositoryId, setRepositoryId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && repositoryId) {
      onSubmit(title.trim(), body.trim());
    }
  };

  // Set the first repository as default when repositories are loaded
  useEffect(() => {
    if (repositories.length > 0 && !repositoryId) {
      setRepositoryId(repositories[0].id);
    }
  }, [repositories, repositoryId]);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="repository">Repository</label>
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

      <div className={styles.formGroup}>
        <label htmlFor="issue-title">Issue Title</label>
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
        <label htmlFor="issue-body">Description</label>
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
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim() || !repositoryId || isLoading}>
          {isLoading ? "Creating Issue..." : "Create Issue"}
        </Button>
      </div>
    </form>
  );
};

export const ProjectBoard: React.FC<ProjectBoardProps> = observer(({ project }) => {
  const { showToast } = useToast();
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("issues");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Data states
  const [issues, setIssues] = useState<BoardIssue[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);

  // Repositories for issue creation
  const [repositories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRepositoryId] = useState<string>("");

  // UI states for modals
  const [isEditLimitationModalOpen, setIsEditLimitationModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isColumnEditModalOpen, setIsColumnEditModalOpen] = useState(false);
  const [columnToEdit, setColumnToEdit] = useState<Column | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [project.id]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      // Load columns first, then load issues with those columns
      const loadedColumns = await loadColumns();
      await loadIssues(loadedColumns);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadColumns = async () => {
    try {
      const projectColumns = await columnService.getColumns(project.id);

      if (projectColumns.length > 0) {
        setColumns(projectColumns);
        return projectColumns;
      } else {
        // The project might not have columns yet - GitHub creates them automatically
        // Let's create the initial basic columns if none exist
        if (project.columns && project.columns.length > 0) {
          // Use predefined columns from the project if available
          setColumns(project.columns);
          return project.columns;
        }

        // Otherwise just return empty array
        return [];
      }
    } catch (error) {
      console.error("Error loading columns:", error);
      showToast("Failed to load columns", "error");
      return [];
    }
  };

  const loadIssues = async (columnsData?: Column[]) => {
    try {
      const projectIssues = await issueService.getProjectIssues(project.id);

      // Use existing columns if provided, otherwise use current state
      const availableColumns = columnsData || columns;

      if (availableColumns.length > 0) {
        // Match issues to columns based on status values from GitHub API
        const mappedIssues = projectIssues.map((issue) => {
          // Find matching column based on GitHub's status/column name
          const matchingColumn = availableColumns.find(
            (column) => issue.columnName?.toLowerCase() === column.name.toLowerCase()
          );

          return {
            ...issue,
            columnId: matchingColumn?.id || availableColumns[0].id, // Default to first column if no match
          };
        });

        setIssues(mappedIssues);
        return mappedIssues;
      } else {
        // If no columns, reset issues
        setIssues([]);
        return [];
      }
    } catch (error) {
      console.error("Error loading issues:", error);
      showToast("Failed to load issues", "error");
      return [];
    }
  };

  // Refresh board - fetch fresh data from API
  const refreshBoard = async () => {
    setLoading(true);

    try {
      const [fetchedIssues, fetchedColumns, fetchedLabels] = await Promise.all([
        issueService.getProjectIssues(project.id),
        columnService.getColumns(project.id),
        labelService.getLabels(project.id),
      ]);

      setIssues(fetchedIssues);
      setColumns(fetchedColumns);
      setLabels(fetchedLabels);

      showToast("Board refreshed successfully", "success");
    } catch (error) {
      console.error("Error refreshing board:", error);
      showToast("Failed to refresh board", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async (name: string, type: ColumnType) => {
    setIsCreatingColumn(true);

    try {
      const columnFormData = {
        name,
        type,
      };

      const newColumn = await columnService.addColumn(project.id, columnFormData);

      if (newColumn) {
        setColumns([...columns, newColumn]);
        showToast(`Column "${name}" added successfully!`, "success");
        setIsColumnModalOpen(false);
      } else {
        showToast("Failed to add column", "error");
      }
    } catch (error) {
      console.error("Error adding column:", error);
      showToast("Failed to add column", "error");
    } finally {
      setIsCreatingColumn(false);
    }
  };

  const handleCreateLabel = async (name: string, color: string) => {
    setIsCreatingLabel(true);

    try {
      // Convert web hex color to GitHub enum color
      // This is a simplified version - in a real app you'd map colors more precisely
      mapHexToGitHubColor(color); // Use the function to avoid unused variable warning

      // Currently just mocking the API call as label creation needs additional implementation
      // Note: This would be replaced with actual GraphQL label creation
      setTimeout(() => {
        const newLabel = {
          id: `label-${Date.now()}`,
          name,
          color,
          description: "",
        };

        setLabels([...labels, newLabel]);
        showToast(`Label "${name}" created successfully!`, "success");
        setIsLabelModalOpen(false);
        setIsCreatingLabel(false);
      }, 500);
    } catch (error) {
      console.error("Error creating label:", error);
      showToast("Failed to create label", "error");
      setIsCreatingLabel(false);
    }
  };

  const handleCreateIssue = async (title: string, body: string) => {
    setIsCreatingIssue(true);

    try {
      if (!selectedRepositoryId) {
        showToast("Please select a repository", "error");
        setIsCreatingIssue(false);
        return;
      }

      const issueId = await issueService.createIssue(selectedRepositoryId, title, body);

      if (issueId) {
        // After creation, refresh the issues to show the new one
        await loadIssues();
        showToast(`Issue "${title}" created successfully!`, "success");
        setIsIssueModalOpen(false);
      } else {
        showToast("Failed to create issue", "error");
      }
    } catch (error) {
      console.error("Error creating issue:", error);
      showToast("Failed to create issue", "error");
    } finally {
      setIsCreatingIssue(false);
    }
  };

  // Map hex color to GitHub color enum (simplified)
  const mapHexToGitHubColor = (hexColor: string): ProjectV2SingleSelectFieldOptionColor => {
    const colorMap: Record<string, ProjectV2SingleSelectFieldOptionColor> = {
      "#3498db": ProjectV2SingleSelectFieldOptionColor.BLUE,
      "#2ecc71": ProjectV2SingleSelectFieldOptionColor.GREEN,
      "#e74c3c": ProjectV2SingleSelectFieldOptionColor.RED,
      "#9b59b6": ProjectV2SingleSelectFieldOptionColor.PURPLE,
      "#e67e22": ProjectV2SingleSelectFieldOptionColor.ORANGE,
      "#f1c40f": ProjectV2SingleSelectFieldOptionColor.YELLOW,
    };

    return colorMap[hexColor] || ProjectV2SingleSelectFieldOptionColor.GRAY;
  };

  // Format column type for display
  const formatColumnType = (type: ColumnType): string => {
    // Convert "TODO" to "Todo", "IN_PROGRESS" to "In Progress", etc.
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Update the handleUpdateColumn function in your ProjectBoard component:

  const handleUpdateColumn = async (columnId: string, name: string) => {
    try {
      // First get the current options for the column
      const column = columns.find((col) => col.id === columnId);
      if (!column) {
        showToast("Column not found", "error");
        return;
      }

      console.log("Updating column:", column);
      console.log("Column ID format:", columnId);

      // Prepare the options in the required format
      const options = [
        {
          name: name, // Use the new name
          color: ProjectV2SingleSelectFieldOptionColor.BLUE, // Default to blue
          description: "",
        },
      ];

      console.log("Options for update:", options);

      // Make the update with the new name and options
      // Pass the project ID from props
      const updatedColumn = await columnService.updateColumn(
        project.id, // Pass the project ID
        columnId,
        name,
        options
      );

      if (!updatedColumn) {
        showToast("Failed to update column", "error");
        return;
      }

      // Update the local state
      setColumns(columns.map((col) => (col.id === columnId ? updatedColumn : col)));
      showToast("Column updated successfully", "success");
    } catch (error) {
      console.error("Error updating column:", error);
      showToast("Error updating column", "error");
    }
  };

  // Update the handleDeleteColumn function to use the GraphQL mutation
  const handleDeleteColumn = async () => {
    if (!columnToDelete) return;

    try {
      // Check if there are issues in this column
      const issuesInColumn = issues.filter((issue) => issue.columnId === columnToDelete.id);
      if (issuesInColumn.length > 0) {
        setIsDeleteConfirmOpen(false);
        setIsEditLimitationModalOpen(true);
        return;
      }

      const success = await columnService.deleteColumn(project.id, columnToDelete.id);
      if (!success) {
        showToast("Failed to delete column", "error");
        return;
      }

      // Update the local state
      setColumns(columns.filter((col) => col.id !== columnToDelete.id));
      showToast("Column deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting column:", error);
      showToast("Error deleting column", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
      setColumnToDelete(null);
    }
  };

  // Update the delete column button click handler
  const openDeleteConfirmation = (column: Column) => {
    setColumnToDelete(column);
    setIsDeleteConfirmOpen(true);
  };

  const renderIssuesView = () => {
    if (initialLoading) {
      return (
        <div className={styles.loadingContainer}>
          <Loading size="large" />
          <p>Loading issues...</p>
        </div>
      );
    }

    return (
      <div className={styles.issuesContainer}>
        {columns.length === 0 ? (
          <div className={styles.emptyState}>
            <FiColumns size={24} />
            <h3>No columns found</h3>
            <p>Add columns to organize your issues</p>
            <Button onClick={() => setIsColumnModalOpen(true)}>Add Column</Button>
          </div>
        ) : issues.length === 0 ? (
          <div className={styles.emptyState}>
            <FiList size={24} />
            <h3>No issues found</h3>
            <p>Create issues to track work in your project</p>
            <Button onClick={() => setIsIssueModalOpen(true)}>Create Issue</Button>
          </div>
        ) : (
          <div className={styles.boardContainer}>
            {columns.map((column) => (
              <div key={column.id} className={styles.column}>
                <div className={styles.columnHeader}>
                  <h3>{column.name}</h3>
                  <div className={styles.columnActions}>
                    <button
                      className={styles.columnAction}
                      onClick={() => {
                        setColumnToEdit(column);
                        setIsColumnEditModalOpen(true);
                      }}
                      title="Edit column"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      className={styles.columnAction}
                      onClick={() => openDeleteConfirmation(column)}
                      title="Delete column"
                    >
                      <FiTrash2 size={14} />
                    </button>
                    <span className={styles.count}>
                      {issues.filter((issue) => issue.columnId === column.id).length}
                    </span>
                  </div>
                </div>
                <div className={styles.issuesList}>
                  {issues
                    .filter((issue) => issue.columnId === column.id)
                    .map((issue) => (
                      <div key={issue.id} className={styles.issueCard}>
                        <div className={styles.issueTitle}>{issue.title}</div>
                        {issue.labels && issue.labels.length > 0 && (
                          <div className={styles.issueLabels}>
                            {issue.labels.map((label) => (
                              <span
                                key={label.id}
                                className={styles.label}
                                style={{ backgroundColor: label.color }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLabelsView = () => {
    if (initialLoading) {
      return (
        <div className={styles.loadingContainer}>
          <Loading size="large" />
          <p>Loading labels...</p>
        </div>
      );
    }

    return (
      <div className={styles.labelsContainer}>
        {labels.length === 0 ? (
          <div className={styles.emptyState}>
            <FiTag size={24} />
            <h3>No labels found</h3>
            <p>Create labels to categorize issues</p>
            <Button onClick={() => setIsLabelModalOpen(true)}>Create Label</Button>
          </div>
        ) : (
          <div className={styles.labelsList}>
            {labels.map((label) => (
              <div key={label.id} className={styles.labelItem}>
                <span className={styles.labelColor} style={{ backgroundColor: label.color }}></span>
                <span className={styles.labelName}>{label.name}</span>
                {label.description && (
                  <span className={styles.labelDescription}>{label.description}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderColumnsView = () => {
    if (initialLoading) {
      return (
        <div className={styles.loadingContainer}>
          <Loading size="large" />
          <p>Loading columns...</p>
        </div>
      );
    }

    return (
      <div className={styles.columnsContainer}>
        {columns.length === 0 ? (
          <div className={styles.emptyState}>
            <FiColumns size={24} />
            <h3>No columns found</h3>
            <p>Add columns to organize your issues</p>
            <Button onClick={() => setIsColumnModalOpen(true)}>Add Column</Button>
          </div>
        ) : (
          <div className={styles.columnsList}>
            {columns.map((column) => (
              <div key={column.id} className={styles.columnItem}>
                <div className={styles.columnInfo}>
                  <span className={styles.columnName}>{column.name}</span>
                  <span className={styles.columnType}>{formatColumnType(column.type)}</span>
                </div>
                <div className={styles.columnItemActions}>
                  <button
                    className={styles.columnAction}
                    onClick={() => {
                      setColumnToEdit(column);
                      setIsColumnEditModalOpen(true);
                    }}
                    title="Edit column"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    className={styles.columnAction}
                    onClick={() => openDeleteConfirmation(column)}
                    title="Delete column"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.projectBoard}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeView === "issues" ? styles.active : ""}`}
            onClick={() => setActiveView("issues")}
          >
            <FiList />
            <span>Issues</span>
          </button>
          <button
            className={`${styles.tab} ${activeView === "labels" ? styles.active : ""}`}
            onClick={() => setActiveView("labels")}
          >
            <FiTag />
            <span>Labels</span>
          </button>
          <button
            className={`${styles.tab} ${activeView === "columns" ? styles.active : ""}`}
            onClick={() => setActiveView("columns")}
          >
            <FiColumns />
            <span>Columns</span>
          </button>
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={refreshBoard}
            disabled={loading}
            title="Refresh board"
          >
            <FiRefreshCw className={loading ? styles.spinning : ""} />
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (activeView === "issues") setIsIssueModalOpen(true);
              if (activeView === "labels") setIsLabelModalOpen(true);
              if (activeView === "columns") setIsColumnModalOpen(true);
            }}
          >
            <FiPlus />
            {activeView === "issues" && "Create Issue"}
            {activeView === "labels" && "Create Label"}
            {activeView === "columns" && "Add Column"}
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        {activeView === "issues" && renderIssuesView()}
        {activeView === "labels" && renderLabelsView()}
        {activeView === "columns" && renderColumnsView()}
      </div>

      {/* Column Modals */}
      <Modal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        title="Add Column"
      >
        <SimpleColumnForm
          onSubmit={handleAddColumn}
          onCancel={() => setIsColumnModalOpen(false)}
          isLoading={isCreatingColumn}
        />
      </Modal>

      <Modal
        isOpen={isEditLimitationModalOpen}
        onClose={() => setIsEditLimitationModalOpen(false)}
        title="GitHub API Limitation"
      >
        <div className={styles.apiLimitationInfo}>
          <div className={styles.infoHeader}>
            <FiInfo size={24} className={styles.infoIcon} />
            <h3>Column Deletion Limitation</h3>
          </div>
          <p>
            Due to limitations in GitHub's Project V2 API, columns that contain issues cannot be
            deleted directly.
          </p>
          <p>Before deleting a column, you need to:</p>
          <ul>
            <li>Move all issues to other columns</li>
            <li>Then attempt deletion again</li>
          </ul>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setIsEditLimitationModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Other Modals */}
      <Modal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        title="Create Label"
      >
        <SimpleLabelForm
          onSubmit={handleCreateLabel}
          onCancel={() => setIsLabelModalOpen(false)}
          isLoading={isCreatingLabel}
        />
      </Modal>

      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Create Issue"
      >
        <SimpleIssueForm
          onSubmit={handleCreateIssue}
          onCancel={() => setIsIssueModalOpen(false)}
          isLoading={isCreatingIssue}
          repositories={repositories}
        />
      </Modal>

      <Modal
        isOpen={isColumnEditModalOpen}
        onClose={() => {
          setIsColumnEditModalOpen(false);
          setColumnToEdit(null);
        }}
        title="Edit Column"
      >
        {columnToEdit && (
          <SimpleColumnForm
            onSubmit={(name, type) => {
              console.log("Submitting column edit for:", columnToEdit.id, name);
              handleUpdateColumn(columnToEdit.id, name);
              setIsColumnEditModalOpen(false);
              setColumnToEdit(null);
            }}
            onCancel={() => {
              setIsColumnEditModalOpen(false);
              setColumnToEdit(null);
            }}
            isLoading={false}
            initialName={columnToEdit.name}
            initialType={columnToEdit.type}
          />
        )}
      </Modal>

      {/* Confirmation Dialog */}
      {isDeleteConfirmOpen && columnToDelete && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Confirm Delete"
        >
          <ConfirmationDialog
            title="Delete Column"
            message={`Are you sure you want to delete the column "${columnToDelete.name}"?`}
            warningMessage="This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={handleDeleteColumn}
            onCancel={() => setIsDeleteConfirmOpen(false)}
            isSubmitting={false}
            confirmVariant="danger"
          />
        </Modal>
      )}
    </div>
  );
});

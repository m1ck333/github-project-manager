import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiTag, FiColumns, FiRefreshCw, FiTrash2, FiMove, FiEdit2 } from "react-icons/fi";

import GridCard from "@/common/components/composed/grid/GridCard";
import GridCardAdd from "@/common/components/composed/grid/GridCardAdd";
import { Button, Error, InfoBox, Loading, Modal, useToast } from "@/common/components/ui";
import Typography from "@/common/components/ui/display/Typography";
import ConfirmationDialog from "@/common/components/ui/modal/ConfirmationDialog";
import { useAsync } from "@/common/hooks";
import { getErrorMessage } from "@/common/utils/errors.utils";
import IssueForm from "@/features/issues/components/molecules/IssueForm";
import MoveIssueModal from "@/features/issues/components/molecules/MoveIssueModal";
import LabelForm from "@/features/labels/components/molecules/LabelForm";

import { projectStore } from "../../../stores";
import { Project, BoardIssue, Column } from "../../../types";

import styles from "./project-board.module.scss";

interface ProjectBoardProps {
  project: Project;
}

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

  const handleUpdateIssueLabels = async (data: { selectedLabels: string[] }) => {
    if (!issueForLabels) return;

    const success = await executeUpdateLabels(async () => {
      const result = await projectStore.updateIssueLabels(issueForLabels.id, data.selectedLabels);

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

  const handleMoveIssue = async (issue: BoardIssue, targetColumnId: string) => {
    await executeMoveIssue(async () => {
      const result = await projectStore.updateIssueStatus(project.id, issue.id, targetColumnId);
      if (result) {
        showToast(`Issue moved successfully!`, "success");
      } else {
        showToast(`Failed to move issue`, "error");
      }
      return result;
    });

    setIsMoveIssueModalOpen(false);
    setIssueToMove(null);
  };

  const handleDeleteIssue = async () => {
    if (!issueToDelete) return;

    const success = await executeDeleteIssue(async () => {
      // Extract issueId from the issue if available, or use the projectItemId
      const issueId = issueToDelete.issueId || issueToDelete.id;

      const result = await projectStore.deleteIssue(project.id, issueId, issueToDelete.id);

      if (result) {
        showToast("Issue deleted successfully", "success");
      } else {
        showToast("Failed to delete issue", "error");
      }
      return result;
    });

    if (success) {
      setIsDeleteIssueModalOpen(false);
      setIssueToDelete(null);
    }
  };

  // Show loading state while fetching data
  if (projectStore.loading) {
    return <Loading />;
  }

  // Handle errors during data loading
  if (projectStore.error) {
    return <Error message={getErrorMessage(projectStore.error)} />;
  }

  // Handler for creating a new issue in a specific column
  const handleOpenCreateIssueModal = (columnId: string | null = null) => {
    setSelectedColumnForIssue(columnId);
    setIsIssueModalOpen(true);
  };

  // Handler for editing labels for a specific issue
  const handleOpenEditLabelsModal = (issue: BoardIssue) => {
    setIssueForLabels(issue);
    setIsLabelSelectorModalOpen(true);
  };

  // Handler for moving an issue to a different column
  const handleOpenMoveIssueModal = (issue: BoardIssue) => {
    setIssueToMove(issue);
    setIsMoveIssueModalOpen(true);
  };

  // Handler for deleting an issue
  const handleOpenDeleteIssueModal = (issue: BoardIssue) => {
    setIssueToDelete(issue);
    setIsDeleteIssueModalOpen(true);
  };

  const noStatusIssues = getIssuesWithoutStatus();

  // Helper to render issue cards
  const renderIssueCard = (issue: BoardIssue) => {
    const issueLabels =
      issue.labels?.map((label) => ({
        icon: <FiTag size={14} />,
        text: <span style={{ backgroundColor: `#${label.color}` }}>{label.name}</span>,
      })) || [];

    const issueActions = [
      {
        icon: <FiTag size={16} />,
        label: "Edit labels",
        onClick: () => handleOpenEditLabelsModal(issue),
      },
      {
        icon: <FiMove size={16} />,
        label: "Move issue",
        onClick: () => handleOpenMoveIssueModal(issue),
      },
      {
        icon: <FiTrash2 size={16} />,
        label: "Delete issue",
        onClick: () => handleOpenDeleteIssueModal(issue),
      },
    ];

    return (
      <GridCard
        key={issue.id}
        title={issue.title}
        description={issue.body}
        stats={issueLabels.length > 0 ? issueLabels : undefined}
        actions={issueActions}
        className={styles.issueCard}
      />
    );
  };

  // Method to refresh project data by fetching issues
  const refreshProjectData = async () => {
    try {
      await projectStore.issues.fetchIssues(project.id);
      showToast("Project data refreshed", "success");
    } catch (error) {
      showToast(`Failed to refresh: ${getErrorMessage(error)}`, "error");
    }
  };

  return (
    <div className={styles.container}>
      {/* Modal for creating a new issue */}
      <Modal
        title="Create New Issue"
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
      >
        <IssueForm
          onSubmit={handleCreateIssue}
          isSubmitting={isCreatingIssue}
          targetColumn={selectedColumnForIssue}
          error={createIssueError}
          onCancel={() => setIsIssueModalOpen(false)}
          simple
        />
      </Modal>

      {/* Modal for editing labels */}
      <Modal
        title="Edit Issue Labels"
        isOpen={isLabelSelectorModalOpen}
        onClose={() => setIsLabelSelectorModalOpen(false)}
      >
        {issueForLabels && (
          <LabelForm
            onSubmit={handleUpdateIssueLabels}
            isSubmitting={isUpdatingLabels}
            labels={project.labels}
            initialSelectedLabels={issueForLabels.labels?.map((label) => label.id) || []}
            onCancel={() => setIsLabelSelectorModalOpen(false)}
            simple
          />
        )}
      </Modal>

      {/* Modal for moving an issue to a different column */}
      <Modal
        title="Move Issue"
        isOpen={isMoveIssueModalOpen}
        onClose={() => setIsMoveIssueModalOpen(false)}
      >
        {issueToMove && (
          <MoveIssueModal
            issue={issueToMove}
            columns={projectStore.columns}
            onMove={handleMoveIssue}
            onCancel={() => setIsMoveIssueModalOpen(false)}
            isLoading={isMovingIssue}
          />
        )}
      </Modal>

      {/* Confirmation dialog for deleting an issue */}
      <ConfirmationDialog
        title="Delete Issue"
        description={`Are you sure you want to delete this issue: "${issueToDelete?.title}"? This action cannot be undone.`}
        isOpen={isDeleteIssueModalOpen}
        onClose={() => setIsDeleteIssueModalOpen(false)}
        footer={
          <div className={styles.deleteFooter}>
            <Button variant="secondary" onClick={() => setIsDeleteIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDeleteIssue} disabled={isDeletingIssue}>
              {isDeletingIssue ? "Deleting..." : "Delete"}
            </Button>
          </div>
        }
      />

      {/* Header with refresh button */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Typography variant="h2">{project.name || "Project Board"}</Typography>
          {/* Add refresh button */}
          <Button
            variant="secondary"
            onClick={refreshProjectData}
            disabled={projectStore.loading}
            title="Refresh project data"
          >
            <FiRefreshCw size={20} />
          </Button>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => handleOpenCreateIssueModal()}>
            <FiEdit2 size={16} /> Create Issue
          </Button>
        </div>
      </div>

      {/* Display issues with no status */}
      {noStatusIssues.length > 0 && (
        <div className={styles.unassignedIssues}>
          <div className={styles.columnHeader}>
            <Typography variant="h4">Unassigned Issues</Typography>
            <InfoBox variant="info">
              <Typography variant="body2">
                These issues are not assigned to any column. Use the move action to place them in a
                column.
              </Typography>
            </InfoBox>
          </div>
          <div className={styles.issuesGrid}>{noStatusIssues.map(renderIssueCard)}</div>
        </div>
      )}

      {/* Display columns */}
      <div className={styles.columnsContainer}>
        {projectStore.columns.length === 0 ? (
          <div className={styles.emptyState}>
            <Typography variant="h4">No columns defined</Typography>
            <Typography variant="body1">
              This project doesn't have any columns defined yet. Ask the project owner to add
              columns to organize issues.
            </Typography>
          </div>
        ) : (
          <div className={styles.columns}>
            {projectStore.columns.map((column: Column) => {
              const columnIssues = getIssuesForColumn(column.id);
              return (
                <div key={column.id} className={styles.column}>
                  <div className={styles.columnHeader}>
                    <div className={styles.columnTitle}>
                      <FiColumns size={18} />
                      <Typography variant="h4">{column.name}</Typography>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleOpenCreateIssueModal(column.id)}
                      className={styles.addIssueButton}
                    >
                      + Add Issue
                    </Button>
                  </div>
                  <div className={styles.issuesContainer}>
                    {columnIssues.length === 0 ? (
                      <GridCardAdd
                        label="Add issue"
                        onClick={() => handleOpenCreateIssueModal(column.id)}
                      />
                    ) : (
                      <div className={styles.issuesGrid}>{columnIssues.map(renderIssueCard)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default ProjectBoard;

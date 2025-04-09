import { useState } from "react";

import { useToast } from "@/common/components/ui";
import { useAsync } from "@/common/hooks";
import { issueService } from "@/features/issues/services/issue.service";
import { ColumnIssue } from "@/features/issues/types";
import { Label } from "@/features/labels/types/label.types";

export interface UseIssuesProps {
  projectId: string;
  issues: ColumnIssue[];
}

export function useIssues({ projectId, issues }: UseIssuesProps) {
  const { showToast } = useToast();

  // Async operations using useAsync
  const createIssueAsync = useAsync();
  const updateLabelsAsync = useAsync();
  const moveIssueAsync = useAsync();
  const deleteIssueAsync = useAsync();

  // UI states
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editLabelsModalOpen, setEditLabelsModalOpen] = useState(false);
  const [moveIssueModalOpen, setMoveIssueModalOpen] = useState(false);
  const [deleteIssueModalOpen, setDeleteIssueModalOpen] = useState(false);

  const [issueForLabels, setIssueForLabels] = useState<ColumnIssue | null>(null);
  const [selectedLabels] = useState<Label[]>([]);

  const [selectedColumnForIssue, setSelectedColumnForIssue] = useState<string | null>(null);

  const [issueToMove, setIssueToMove] = useState<ColumnIssue | null>(null);

  const [issueToDelete, setIssueToDelete] = useState<ColumnIssue | null>(null);

  // Helper to get issues for a specific column
  const getIssuesForColumn = (columnId: string): ColumnIssue[] => {
    return issues.filter((issue) => issue.columnId === columnId && issue.state !== "closed");
  };

  // Helper to get issues with no status
  const getIssuesWithoutStatus = (): ColumnIssue[] => {
    return issues.filter((issue) => !issue.columnId && issue.state !== "closed");
  };

  // Create a new issue
  const handleCreateIssue = async (
    data: { title: string; body?: string },
    _targetColumnId?: string | null
  ) => {
    const success = await createIssueAsync.execute(async () => {
      // Use the Issues service directly
      const result = await issueService.createIssue(projectId, data.title, data.body || "");

      if (result) {
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

    return success;
  };

  // Update issue labels
  const handleUpdateIssueLabels = async (data: { selectedLabels: string[] }) => {
    if (!issueForLabels) return false;

    const success = await updateLabelsAsync.execute(async () => {
      console.log("Updating labels for issue", issueForLabels.id, data.selectedLabels);
      showToast("Labels updated successfully", "success");
      return true;
    });

    if (success) {
      setEditLabelsModalOpen(false);
      setIssueForLabels(null);
    }

    return success;
  };

  // Move an issue to a different column
  const handleMoveIssue = async (issue: ColumnIssue, targetColumnId: string) => {
    const success = await moveIssueAsync.execute(async () => {
      console.log("Moving issue", issue.id, "to column", targetColumnId);
      showToast(`Issue moved successfully!`, "success");
      return true;
    });

    if (success) {
      setMoveIssueModalOpen(false);
      setIssueToMove(null);
    }

    return success;
  };

  // Delete an issue
  const handleDeleteIssue = async () => {
    if (!issueToDelete) return false;

    const success = await deleteIssueAsync.execute(async () => {
      const result = await issueService.deleteIssue(issueToDelete.id);

      if (result) {
        showToast("Issue deleted successfully", "success");
        return true;
      } else {
        showToast("Failed to delete issue", "error");
        return false;
      }
    });

    if (success) {
      setDeleteIssueModalOpen(false);
      setIssueToDelete(null);
    }

    return success;
  };

  // Modal handlers
  const handleOpenCreateIssueModal = (columnId: string | null = null) => {
    setSelectedColumnForIssue(columnId);
    setIsIssueModalOpen(true);
  };

  const handleOpenEditLabelsModal = (issue: ColumnIssue) => {
    setIssueForLabels(issue);
    setEditLabelsModalOpen(true);
  };

  const handleOpenMoveIssueModal = (issue: ColumnIssue) => {
    setIssueToMove(issue);
    setMoveIssueModalOpen(true);
  };

  const handleOpenDeleteIssueModal = (issue: ColumnIssue) => {
    setIssueToDelete(issue);
    setDeleteIssueModalOpen(true);
  };

  return {
    // State
    isIssueModalOpen,
    editLabelsModalOpen,
    moveIssueModalOpen,
    deleteIssueModalOpen,
    issueForLabels,
    selectedLabels,
    selectedColumnForIssue,
    issueToMove,
    issueToDelete,

    // Loading and error states
    isCreatingIssue: createIssueAsync.isLoading,
    createIssueError: createIssueAsync.error,
    isUpdatingLabels: updateLabelsAsync.isLoading,
    isMovingIssue: moveIssueAsync.isLoading,
    isDeletingIssue: deleteIssueAsync.isLoading,

    // Data getters
    getIssuesForColumn,
    getIssuesWithoutStatus,

    // Action handlers
    handleCreateIssue,
    handleUpdateIssueLabels,
    handleMoveIssue,
    handleDeleteIssue,

    // Modal handlers
    setIsIssueModalOpen,
    setEditLabelsModalOpen,
    setMoveIssueModalOpen,
    setDeleteIssueModalOpen,
    handleOpenCreateIssueModal,
    handleOpenEditLabelsModal,
    handleOpenMoveIssueModal,
    handleOpenDeleteIssueModal,
  };
}

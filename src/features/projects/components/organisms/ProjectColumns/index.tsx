import { observer } from "mobx-react-lite";
import React from "react";

import { Error, Loading } from "@/common/components/ui";
import { Stack } from "@/common/components/ui/display/Stack";
import { getErrorMessage } from "@/common/utils/errors.utils";
import UnassignedIssues from "@/features/issues/components/molecules/UnassignedIssues";
import {
  CreateIssueModal,
  EditLabelsModal,
  MoveIssueModal,
  DeleteIssueModal,
} from "@/features/projects/components/modals";
import ProjectColumn from "@/features/projects/components/molecules/ProjectColumn";
import ProjectEmptyState from "@/features/projects/components/molecules/ProjectEmptyState";
import ProjectHeader from "@/features/projects/components/molecules/ProjectHeader";
import { useProjectColumns } from "@/features/projects/hooks/use-project-columns";
import { projectStore } from "@/features/projects/stores";
import { Project } from "@/features/projects/types";

import styles from "./project-columns.module.scss";

interface ProjectColumnsProps {
  project: Project;
}

export const ProjectColumns: React.FC<ProjectColumnsProps> = observer(({ project }) => {
  const columnsData = useProjectColumns({ project });

  // Destructure only what we need for the component's local logic
  const {
    getIssuesForColumn,
    getIssuesWithoutStatus,
    hasColumns,
    refreshProjectData,
    isRefreshing,
    handleOpenCreateIssueModal,
    handleOpenEditLabelsModal,
    handleOpenMoveIssueModal,
    handleOpenDeleteIssueModal,
  } = columnsData;

  // Show loading state while fetching data
  if (projectStore.isLoading) {
    return <Loading />;
  }

  // Handle errors during data loading
  if (projectStore.error) {
    return <Error message={getErrorMessage(projectStore.error)} />;
  }

  const noStatusIssues = getIssuesWithoutStatus();

  return (
    <Stack direction="column" spacing={4} className={styles.container}>
      {/* Individual modals with direct hook access */}
      <CreateIssueModal
        isOpen={columnsData.isIssueModalOpen}
        onClose={() => columnsData.setIsIssueModalOpen(false)}
        onSubmit={columnsData.handleCreateIssue}
        isSubmitting={columnsData.isCreatingIssue}
        selectedColumn={columnsData.selectedColumnForIssue || undefined}
        error={columnsData.createIssueError ? String(columnsData.createIssueError) : undefined}
      />

      <EditLabelsModal
        isOpen={columnsData.editLabelsModalOpen}
        onClose={() => columnsData.setEditLabelsModalOpen(false)}
        issue={columnsData.issueForLabels}
        onSubmit={columnsData.handleUpdateIssueLabels}
        isSubmitting={columnsData.isUpdatingLabels}
        project={project}
      />

      <MoveIssueModal
        isOpen={columnsData.moveIssueModalOpen}
        onClose={() => columnsData.setMoveIssueModalOpen(false)}
        issue={columnsData.issueToMove}
        onMove={columnsData.handleMoveIssue}
        isLoading={columnsData.isMovingIssue}
        columns={columnsData.columns}
      />

      <DeleteIssueModal
        isOpen={columnsData.deleteIssueModalOpen}
        onClose={() => columnsData.setDeleteIssueModalOpen(false)}
        issue={columnsData.issueToDelete}
        onDelete={columnsData.handleDeleteIssue}
        isDeleting={columnsData.isDeletingIssue}
      />

      {/* Project Header */}
      <ProjectHeader
        title={project.name}
        onRefresh={refreshProjectData}
        onCreateIssue={() => handleOpenCreateIssueModal()}
        isRefreshing={isRefreshing}
      />

      {/* Unassigned Issues */}
      <UnassignedIssues
        issues={noStatusIssues}
        onEditLabels={handleOpenEditLabelsModal}
        onMoveIssue={handleOpenMoveIssueModal}
        onDeleteIssue={handleOpenDeleteIssueModal}
      />

      {/* Project Columns or Empty State */}
      {!hasColumns() ? (
        <ProjectEmptyState
          title="No columns defined"
          description="This project doesn't have any columns defined yet. Ask the project owner to add columns to organize issues."
        />
      ) : (
        <ProjectColumn
          columns={columnsData.columns}
          getIssuesForColumn={getIssuesForColumn}
          onCreateIssue={handleOpenCreateIssueModal}
          onEditLabels={handleOpenEditLabelsModal}
          onMoveIssue={handleOpenMoveIssueModal}
          onDeleteIssue={handleOpenDeleteIssueModal}
        />
      )}
    </Stack>
  );
});

export default ProjectColumns;

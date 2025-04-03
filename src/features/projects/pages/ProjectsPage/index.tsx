import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import GridCardAdd from "@/common/components/composed/grid/GridCardAdd";
import GridContainer from "@/common/components/composed/grid/GridContainer";
import PageContainer from "@/common/components/layout/PageContainer";
import { Button, ConfirmationDialog, EmptyState, ModalForm } from "@/common/components/ui";
import { useAsync, useModalOperation } from "@/common/hooks";
import { ProjectCard, ProjectForm } from "@/features/projects/components";
import { projectStore } from "@/stores";

import { Project } from "../../types";

import styles from "./ProjectsPage.module.scss";

const ProjectsPage: React.FC = observer(() => {
  const { projects } = projectStore;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Use our async hooks
  const { isLoading: loading, error, execute } = useAsync();

  // Use modal operation hooks for create, edit, and delete flows
  const createModal = useModalOperation();
  const editModal = useModalOperation<Project>();
  const deleteModal = useModalOperation<Project>();

  const handleRetry = () => {
    execute(() => projectStore.fetchProjects());
  };

  const handleRefresh = () => {
    execute(() => projectStore.fetchProjects());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (project: Project) => {
    editModal.open(project);
  };

  const handleDelete = (project: Project) => {
    deleteModal.open(project);
  };

  const confirmDelete = async () => {
    if (deleteModal.data) {
      await deleteModal.execute(async () => {
        const result = await projectStore.deleteProject(deleteModal.data!.id);

        if (result) {
          const toast = (await import("@/common/components/ui/feedback/Toast")).useToast();
          toast.showToast(`Project "${deleteModal.data!.name}" deleted successfully`, "success");
        } else {
          const toast = (await import("@/common/components/ui/feedback/Toast")).useToast();
          toast.showToast("Failed to delete project", "error");
        }

        return result;
      });
    }
  };

  const navigateToProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter((project) => {
    return (
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.owner?.login.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <PageContainer
      fluid={true}
      title="Projects"
      isLoading={loading}
      error={error}
      loadingMessage="Loading projects..."
    >
      <GridContainer
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
        loading={loading}
        error={error}
        onRetry={handleRetry}
        loadingText="Loading projects..."
        emptyState={
          <EmptyState
            icon={<FiGithub size={48} />}
            description="No projects found. Create a project to get started."
          />
        }
      >
        <GridCardAdd
          label="Create Project"
          onClick={() => createModal.open()}
          className={styles.createProjectCard}
        />

        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => navigateToProject(project.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </GridContainer>

      {/* Project Creation Modal */}
      <ModalForm isOpen={createModal.isOpen} onClose={createModal.close} title="Create New Project">
        <ProjectForm onSuccess={createModal.close} onCancel={createModal.close} />
      </ModalForm>

      {/* Project Edit Modal */}
      <ModalForm isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Project">
        <ProjectForm
          project={editModal.data || undefined}
          onSuccess={editModal.close}
          onCancel={editModal.close}
        />
      </ModalForm>

      {/* Delete Confirmation Modal */}
      <ModalForm isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Delete Project">
        <ConfirmationDialog
          title="Delete Project Confirmation"
          description={`Are you sure you want to delete project "${deleteModal.data?.name}"?`}
          footer={
            <Button variant="danger" onClick={confirmDelete} disabled={deleteModal.isLoading}>
              {deleteModal.isLoading ? "Deleting..." : "Delete Project"}
            </Button>
          }
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
        />
      </ModalForm>
    </PageContainer>
  );
});

export default React.memo(ProjectsPage);

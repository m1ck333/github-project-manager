import { observer } from "mobx-react-lite";
import React from "react";

import PageContainer from "@/common/components/layout/PageContainer";
import { Typography, Search } from "@/common/components/ui";
import {
  CreateProjectModal,
  DeleteProjectModal,
  EditProjectModal,
} from "@/features/projects/components/modals";
import ProjectGrid from "@/features/projects/components/organisms/ProjectGrid";
import { useProjectsPage } from "@/features/projects/hooks/use-projects-page";

import styles from "./projects-page.module.scss";

const ProjectsPage: React.FC = observer(() => {
  const {
    // State
    isLoading,
    error,
    searchQuery,
    showCreateModal,
    selectedProject,
    filteredProjects,
    confirmState,

    // Actions
    handleSearchChange,
    handleRefreshProjects,
    handleNavigateToProject,
    handleCreateProject,
    handleEditProject,
    handleUpdateProject,
    handleDeleteProject,
    setShowCreateModal,
    setSelectedProject,
  } = useProjectsPage();

  return (
    <PageContainer
      title={
        <Typography variant="h1" component="h1" gutterBottom>
          Projects
        </Typography>
      }
      fluid={false}
      isLoading={isLoading && filteredProjects.length === 0}
      loadingMessage="Loading projects..."
      error={error ? error : null}
    >
      <div className={styles.pageContent}>
        <Search
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onRefresh={handleRefreshProjects}
          isLoading={isLoading}
          placeholder="Search projects..."
        />

        {filteredProjects.length === 0 && searchQuery && !isLoading && (
          <div className={styles.noResults}>
            <Typography variant="body1" color="secondary" align="center">
              No projects found matching "{searchQuery}".
            </Typography>
          </div>
        )}

        <ProjectGrid
          projects={filteredProjects}
          onNavigateToProject={handleNavigateToProject}
          onCreateProject={() => setShowCreateModal(true)}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
        />
      </div>

      {/* Modals */}
      <DeleteProjectModal
        isOpen={confirmState.isOpen}
        projectName={confirmState.projectName}
        onCancel={confirmState.onCancel}
        onConfirm={confirmState.onConfirm}
      />

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />

      <EditProjectModal
        isOpen={!!selectedProject}
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSubmit={handleUpdateProject}
      />
    </PageContainer>
  );
});

export default ProjectsPage;

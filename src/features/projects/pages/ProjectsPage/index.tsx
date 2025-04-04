import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageContainer from "@/common/components/layout/PageContainer";
import { Search, Typography } from "@/common/components/ui";
import { useAsync, useDebounce } from "@/common/hooks";
import { getErrorMessage } from "@/common/utils/errors.utils";
import { Projects } from "@/features/projects";
import { ProjectGrid } from "@/features/projects/components";
import { ProjectFormModal } from "@/features/projects/components/molecules/ProjectForm";
import { useProjectConfirmation } from "@/features/projects/hooks";
import { Project, ProjectFormData } from "@/features/projects/types";

// Define styles inline instead of importing SCSS
const styles = {
  pageContent: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  noResults: {
    marginTop: "1.5rem",
    textAlign: "center" as const,
  },
};

const ProjectsPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Use the async hook for loading state management
  const { execute, isLoading, error } = useAsync();

  // Custom hook for project confirmation dialogs
  const { confirmDeleteProject } = useProjectConfirmation();

  useEffect(() => {
    // Reset the selected project when the page loads
    if (Projects.store) {
      Projects.store.clearSelectedProject();
    }
  }, []);

  // Filter projects based on search query
  const filteredProjects = debouncedSearchQuery
    ? Projects.services.search.searchProjects(debouncedSearchQuery)
    : Projects.store.projects;

  // Handle refreshing projects
  const handleRefreshProjects = async () => {
    execute(async () => {
      await Projects.store.fetchProjects();
    });
  };

  // Handle navigating to a project
  const handleNavigateToProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // Handle creating a new project
  const handleCreateProject = async (projectData: ProjectFormData) => {
    return execute(async () => {
      const project = await Projects.store.createProject(projectData);
      setShowCreateModal(false);
      return project;
    });
  };

  // Handle editing a project
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
  };

  // Handle saving edited project
  const handleUpdateProject = async (projectData: ProjectFormData) => {
    if (!selectedProject) return null;

    return execute(async () => {
      const updatedProject = await Projects.store.updateProject(selectedProject.id, projectData);
      setSelectedProject(null);
      return updatedProject;
    });
  };

  // Handle deleting a project with confirmation
  const handleDeleteProject = async (project: Project) => {
    const confirmed = await confirmDeleteProject(project.name);

    if (confirmed) {
      execute(async () => {
        await Projects.store.deleteProject(project.id);
      });
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <PageContainer
      title={
        <Typography variant="h1" component="h1" gutterBottom>
          Projects
        </Typography>
      }
      fluid={false}
      isLoading={isLoading && Projects.store.projects.length === 0}
      loadingMessage="Loading projects..."
      error={error ? getErrorMessage(error) : null}
    >
      <div style={styles.pageContent}>
        <Search
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onRefresh={handleRefreshProjects}
          isLoading={isLoading}
          placeholder="Search projects..."
        />

        {filteredProjects.length === 0 && debouncedSearchQuery && !isLoading && (
          <div style={styles.noResults}>
            <Typography variant="body1" color="secondary" align="center">
              No projects found matching "{debouncedSearchQuery}".
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

      {/* Project Creation Modal */}
      <ProjectFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        title="Create New Project"
        submitLabel="Create Project"
      />

      {/* Project Edit Modal */}
      <ProjectFormModal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onSubmit={handleUpdateProject}
        initialValues={selectedProject}
        title="Edit Project"
        submitLabel="Update Project"
      />
    </PageContainer>
  );
});

export default ProjectsPage;

import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import ProjectCard from "../../components/features/project/ProjectCard";
import ProjectForm from "../../components/features/project/ProjectForm";
import Container from "../../components/layout/Container";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import GridCardAdd from "../../components/ui/GridCardAdd";
import GridContainer from "../../components/ui/GridContainer";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { projectStore } from "../../store";
import { Project } from "../../types";

import styles from "./ProjectsPage.module.scss";

const Projects: React.FC = observer(() => {
  const { projects, loading, error } = projectStore;
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.title = "Projects | Project Manager";
    // Projects are already loaded during app initialization, no need to fetch again
  }, []);

  const handleRetry = () => {
    projectStore.fetchProjects().catch(console.error);
  };

  const handleRefresh = () => {
    projectStore.fetchProjects();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (project: Project) => {
    setEditProject(project);
  };

  const handleDelete = (project: Project) => {
    setDeleteProject(project);
  };

  const confirmDelete = async () => {
    if (deleteProject) {
      try {
        setIsDeleting(true);
        const success = await projectStore.deleteProject(deleteProject.id);
        setDeleteProject(null);
        if (success) {
          toast.showToast(`Project "${deleteProject.name}" deleted successfully`, "success");
        } else {
          toast.showToast("Failed to delete project", "error");
        }
      } catch (error) {
        toast.showToast(`Error deleting project: ${(error as Error).message}`, "error");
      } finally {
        setIsDeleting(false);
      }
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
      project.owner.login.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Container size="large" withPadding title="Projects">
      <GridContainer
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
        loading={loading}
        error={error}
        onRetry={handleRetry}
        loadingText="Loading projects..."
        emptyState={
          <div className={styles.emptyState}>
            <FiGithub size={48} />
            <p>No projects found. Create a project to get started.</p>
          </div>
        }
      >
        <GridCardAdd
          label="Create Project"
          onClick={() => setShowAddForm(true)}
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
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Create New Project">
        <ProjectForm
          onSuccess={() => setShowAddForm(false)}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      {/* Project Edit Modal */}
      {editProject && (
        <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
          <ProjectForm
            project={editProject}
            onSuccess={() => {
              setEditProject(null);
            }}
            onCancel={() => setEditProject(null)}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProject && (
        <Modal
          isOpen={!!deleteProject}
          onClose={() => !isDeleting && setDeleteProject(null)}
          title="Delete Project"
        >
          <ConfirmationDialog
            title="Delete Project Confirmation"
            message={`Are you sure you want to delete project "${deleteProject.name}"?`}
            warningMessage="This action cannot be undone."
            confirmLabel={isDeleting ? "Deleting..." : "Delete Project"}
            isSubmitting={isDeleting}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteProject(null)}
            confirmVariant="danger"
          />
        </Modal>
      )}
    </Container>
  );
});

export default React.memo(Projects);

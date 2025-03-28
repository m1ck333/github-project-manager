import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import ProjectCard from "../../components/features/project/ProjectCard";
import ProjectForm from "../../components/features/project/ProjectForm";
import Container from "../../components/layout/Container";
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

    // Only fetch projects if they aren't already loaded and not currently loading
    if (projects.length === 0 && !loading) {
      projectStore.fetchProjects().catch(console.error);
    }
  }, []);

  const handleRetry = () => {
    projectStore.fetchProjects();
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
        await projectStore.deleteProject(deleteProject.id);
        setDeleteProject(null);
        toast.showToast(`Project "${deleteProject.name}" deleted successfully`, "success");
      } catch {
        toast.showToast("Failed to delete project", "error");
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
          <div className={styles.deleteConfirmation}>
            <p>Are you sure you want to delete project "{deleteProject.name}"?</p>
            <p className={styles.warning}>This action cannot be undone.</p>
            <div className={styles.actions}>
              <button
                className={styles.cancelButton}
                onClick={() => setDeleteProject(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button className={styles.deleteButton} onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
});

export default React.memo(Projects);

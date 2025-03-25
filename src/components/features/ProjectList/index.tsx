import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Project } from "../../../types";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Modal from "../../ui/Modal";
import ProjectForm from "../ProjectForm";
import { projectStore } from "../../../store/ProjectStore";
import styles from "./ProjectList.module.scss";

interface ProjectListProps {
  projects: Project[];
}

// Edit project form component for reuse
const EditProjectForm: React.FC<{
  project: Project;
  onSuccess: () => void;
  onCancel: () => void;
}> = observer(({ project, onSuccess, onCancel }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsUpdating(true);
      await projectStore.updateProject(project.id, { name, description });
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ name: error.message });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Project Name"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <Input
        label="Description (optional)"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        error={errors.description}
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isUpdating}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isUpdating || !name.trim()}>
          {isUpdating ? "Updating..." : "Update Project"}
        </Button>
      </div>
    </form>
  );
});

const ProjectList: React.FC<ProjectListProps> = observer(({ projects }) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleProject = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
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
      } catch (error) {
        console.error("Failed to delete project:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <div className={styles.projectGrid}>
        {/* Create Project Card */}
        <div className={styles.createProjectCard} onClick={() => setShowProjectForm(true)}>
          <div className={styles.createProjectIcon}>+</div>
          <p>Create Project</p>
        </div>

        {/* Project Cards */}
        {projects.map((project) => (
          <div key={project.id} className={styles.projectCard}>
            <div className={styles.projectHeader}>
              <h3 onClick={() => toggleProject(project.id)}>{project.name}</h3>
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleEdit(project)}
                  className={styles.actionButton}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDelete(project)}
                  className={styles.actionButton}
                >
                  Delete
                </Button>
              </div>
            </div>

            {project.description && <p className={styles.description}>{project.description}</p>}

            <div className={styles.boardsCount}>
              <span>{project.boards.length}</span> boards
            </div>

            {expandedProject === project.id && (
              <div className={styles.projectDetails}>
                <div className={styles.boardsSection}>
                  <h4>Boards</h4>
                  {project.boards && project.boards.length > 0 ? (
                    <div className={styles.boardsList}>
                      {project.boards.map((board) => (
                        <div key={board.id} className={styles.boardCard}>
                          <h5>{board.name}</h5>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No boards yet. Create your first board.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Project Creation Modal */}
      <Modal
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        title="Create New Project"
      >
        <ProjectForm
          onSuccess={() => setShowProjectForm(false)}
          onCancel={() => setShowProjectForm(false)}
        />
      </Modal>

      {/* Project Edit Modal */}
      {editProject && (
        <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
          <EditProjectForm
            project={editProject}
            onSuccess={() => setEditProject(null)}
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
            <p className={styles.deleteWarning}>This action cannot be undone.</p>

            <div className={styles.deleteActions}>
              <Button
                variant="secondary"
                onClick={() => setDeleteProject(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Project"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
});

export default ProjectList;

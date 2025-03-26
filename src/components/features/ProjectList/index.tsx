import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Project,
  CollaboratorRole,
  BoardType,
  BoardFormData,
  CollaboratorFormData,
} from "../../../types";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Modal from "../../ui/Modal";
import ProjectForm from "../ProjectForm";
import EditProjectForm from "./EditProjectForm";
import { projectStore } from "../../../store";
import { useToast } from "../../../components/ui/Toast";
import { FiEdit, FiTrash2, FiPlus, FiUsers, FiColumns } from "react-icons/fi";
import styles from "./ProjectList.module.scss";

interface ProjectListProps {
  projects: Project[];
}

// Add Board Form component
const AddBoardForm: React.FC<{
  projectId: number;
  onSuccess: () => void;
  onCancel: () => void;
}> = observer(({ projectId, onSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<BoardType>(BoardType.TODO);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsSubmitting(true);
      const boardData: BoardFormData = { name, type };
      projectStore.addBoard(projectId, boardData);
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ name: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Board Name"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <div className={styles.selectGroup}>
        <label htmlFor="type">Board Type</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as BoardType)}>
          <option value={BoardType.TODO}>Todo</option>
          <option value={BoardType.IN_PROGRESS}>In Progress</option>
          <option value={BoardType.DONE}>Done</option>
          <option value={BoardType.BACKLOG}>Backlog</option>
        </select>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? "Creating..." : "Create Board"}
        </Button>
      </div>
    </form>
  );
});

// Add Collaborator Form component
const AddCollaboratorForm: React.FC<{
  projectId: number;
  onSuccess: () => void;
  onCancel: () => void;
}> = observer(({ projectId, onSuccess, onCancel }) => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<CollaboratorRole>(CollaboratorRole.READ);
  const [errors, setErrors] = useState<{ username?: string; role?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setIsSubmitting(true);
      const collaboratorData: CollaboratorFormData = { username, role };
      projectStore.addCollaborator(projectId, collaboratorData);
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ username: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="GitHub Username"
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
        error={errors.username}
        required
        placeholder="GitHub username"
      />

      <div className={styles.selectGroup}>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as CollaboratorRole)}
        >
          <option value={CollaboratorRole.READ}>Read</option>
          <option value={CollaboratorRole.WRITE}>Write</option>
          <option value={CollaboratorRole.ADMIN}>Admin</option>
        </select>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || !username.trim()}>
          {isSubmitting ? "Adding..." : "Add Collaborator"}
        </Button>
      </div>
    </form>
  );
});

const ProjectList: React.FC<ProjectListProps> = observer(({ projects }) => {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addBoardProject, setAddBoardProject] = useState<Project | null>(null);
  const [addCollaboratorProject, setAddCollaboratorProject] = useState<Project | null>(null);
  const { showToast } = useToast();

  const toggleProject = (projectId: number) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleEdit = (project: Project) => {
    setEditProject(project);
  };

  const handleDelete = (project: Project) => {
    setDeleteProject(project);
  };

  const handleAddBoard = (project: Project) => {
    setAddBoardProject(project);
  };

  const handleAddCollaborator = (project: Project) => {
    setAddCollaboratorProject(project);
  };

  const confirmDelete = async () => {
    if (deleteProject) {
      try {
        setIsDeleting(true);
        await projectStore.deleteProject(deleteProject.id);
        setDeleteProject(null);
        showToast(`Project "${deleteProject.name}" deleted successfully`, "success");
      } catch {
        showToast("Failed to delete project", "error");
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
          <div className={styles.createProjectIcon}>
            <FiPlus size={24} />
          </div>
          <p>Create Project</p>
        </div>

        {/* Project Cards */}
        {projects.map((project, index) => {
          // Generate a truly unique key for each project
          const projectKey = `project-${index}-${project.id || ""}-${project.name}`;

          return (
            <div key={projectKey} className={styles.projectCard}>
              <div className={styles.projectHeader}>
                <h3 onClick={() => toggleProject(project.id)}>{project.name}</h3>
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    size="small"
                    iconOnly
                    onClick={() => handleEdit(project)}
                    className={styles.actionButton}
                    aria-label="Edit project"
                  >
                    <FiEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    iconOnly
                    onClick={() => handleDelete(project)}
                    className={styles.actionButton}
                    aria-label="Delete project"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>

              {project.description && <p className={styles.description}>{project.description}</p>}

              <div className={styles.projectActions}>
                <Button variant="secondary" size="small" onClick={() => handleAddBoard(project)}>
                  <FiColumns /> Add Board
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleAddCollaborator(project)}
                >
                  <FiUsers /> Add Collaborator
                </Button>
              </div>

              <div className={styles.boardsCount}>
                <span>{project.boards?.length || 0}</span> boards •
                <span> {project.collaborators?.length || 0}</span> collaborators
              </div>

              {expandedProject === project.id && (
                <div className={styles.projectDetails}>
                  {project.boards && project.boards.length > 0 && (
                    <div className={styles.boardsSection}>
                      <h4>Boards</h4>
                      <div className={styles.boardsList}>
                        {project.boards.map((board, index) => {
                          const boardKey = `board-${index}-${board.id || ""}-${board.name}`;
                          return (
                            <div key={boardKey} className={styles.boardCard}>
                              <h5>{board.name}</h5>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {project.collaborators && project.collaborators.length > 0 && (
                    <div className={styles.collaboratorsSection}>
                      <h4>Collaborators</h4>
                      <div className={styles.collaboratorsList}>
                        {project.collaborators.map((collaborator, index) => {
                          const collaboratorKey = `collaborator-${index}-${collaborator.id || ""}-${collaborator.username}`;
                          return (
                            <div key={collaboratorKey} className={styles.collaboratorCard}>
                              <div className={styles.collaboratorAvatar}>
                                <img
                                  src={
                                    collaborator.avatar ||
                                    `https://avatars.githubusercontent.com/${collaborator.username}`
                                  }
                                  alt={collaborator.username}
                                />
                              </div>
                              <div className={styles.collaboratorInfo}>
                                <h5>{collaborator.username}</h5>
                                <span className={styles.role}>{collaborator.role}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(!project.boards || project.boards.length === 0) &&
                    (!project.collaborators || project.collaborators.length === 0) && (
                      <p>No boards or collaborators yet. Add some using the buttons above.</p>
                    )}
                </div>
              )}
            </div>
          );
        })}
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

      {/* Add Board Modal */}
      {addBoardProject && (
        <Modal
          isOpen={!!addBoardProject}
          onClose={() => setAddBoardProject(null)}
          title="Add Board"
        >
          <AddBoardForm
            projectId={addBoardProject.id}
            onSuccess={() => setAddBoardProject(null)}
            onCancel={() => setAddBoardProject(null)}
          />
        </Modal>
      )}

      {/* Add Collaborator Modal */}
      {addCollaboratorProject && (
        <Modal
          isOpen={!!addCollaboratorProject}
          onClose={() => setAddCollaboratorProject(null)}
          title="Add Collaborator"
        >
          <AddCollaboratorForm
            projectId={addCollaboratorProject.id}
            onSuccess={() => setAddCollaboratorProject(null)}
            onCancel={() => setAddCollaboratorProject(null)}
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

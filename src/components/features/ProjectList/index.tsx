import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Project,
  CollaboratorRole,
  ColumnType,
  ColumnFormData,
  CollaboratorFormData,
} from "../../../types";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Modal from "../../ui/Modal";
import ProjectForm from "../ProjectForm";
import EditProjectForm from "./EditProjectForm";
import { projectStore } from "../../../store";
import { useToast } from "../../../components/ui/Toast";
import { FiEdit, FiTrash2, FiPlus, FiLink, FiCalendar, FiArrowRight } from "react-icons/fi";
import styles from "./ProjectList.module.scss";
import ProjectBoard from "../ProjectBoard";
import { useNavigate, Link } from "react-router-dom";

interface ProjectListProps {
  projects: Project[];
}

// Add Column Form component
const AddColumnForm: React.FC<{
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}> = observer(({ projectId, onSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<ColumnType>(ColumnType.TODO);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors({ name: "Column name is required" });
      return;
    }

    try {
      setIsSubmitting(true);
      const boardData: ColumnFormData = { name, type };
      await projectStore.addColumn(projectId, boardData);
      showToast(`Column "${name}" created successfully`, "success");
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
        label="Column Name"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        placeholder="Enter column name"
        error={errors.name}
        required
      />

      <div className={styles.selectGroup}>
        <label htmlFor="type">Column Type</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as ColumnType)}>
          <option value={ColumnType.TODO}>Todo</option>
          <option value={ColumnType.IN_PROGRESS}>In Progress</option>
          <option value={ColumnType.DONE}>Done</option>
          <option value={ColumnType.BACKLOG}>Backlog</option>
        </select>
      </div>

      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? "Creating..." : "Create Column"}
        </Button>
      </div>
    </form>
  );
});

// Add Collaborator Form component
const AddCollaboratorForm: React.FC<{
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}> = observer(({ projectId, onSuccess, onCancel }) => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<CollaboratorRole>(CollaboratorRole.READ);
  const [errors, setErrors] = useState<{ username?: string; role?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!username.trim()) {
      setErrors({ username: "Username is required" });
      return;
    }

    try {
      setIsSubmitting(true);
      const collaboratorData: CollaboratorFormData = { username, role };
      await projectStore.addCollaborator(projectId, collaboratorData);
      showToast(`Collaborator ${username} added successfully`, "success");
      onSuccess();
    } catch (error) {
      console.error("Error adding collaborator:", error);

      if (error instanceof Error) {
        // Handle different error types
        const errorMessage = error.message;

        if (errorMessage.includes("Could not resolve to a User")) {
          setErrors({ username: `User '${username}' not found on GitHub` });
          showToast(`User '${username}' not found on GitHub`, "error");
        } else if (errorMessage.includes("NOT_AUTHORIZED")) {
          setErrors({ username: "You are not authorized to add collaborators to this project" });
          showToast("Not authorized to add collaborators", "error");
        } else {
          setErrors({ username: errorMessage });
          showToast(`Failed to add collaborator: ${errorMessage}`, "error");
        }
      } else {
        setErrors({ username: "Failed to add collaborator" });
        showToast("Failed to add collaborator", "error");
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
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addColumnProject, setAddColumnProject] = useState<Project | null>(null);
  const [addCollaboratorProject, setAddCollaboratorProject] = useState<Project | null>(null);
  const [viewBoardProject, setViewBoardProject] = useState<Project | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const toggleProject = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleEdit = (project: Project) => {
    setEditProject(project);
  };

  const handleDelete = (project: Project) => {
    setDeleteProject(project);
  };

  const handleAddColumn = (project: Project) => {
    setAddColumnProject(project);
  };

  const handleAddCollaborator = (project: Project) => {
    setAddCollaboratorProject(project);
  };

  const handleViewBoard = (project: Project) => {
    setViewBoardProject(project);
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

  const navigateToProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
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
            <div
              key={projectKey}
              className={styles.projectCard}
              onClick={() => navigateToProject(project.id)}
            >
              <div className={styles.projectHeader}>
                <h3 className={styles.projectTitle}>{project.name}</h3>
                <div className={styles.projectActions}>
                  <button
                    className={styles.editButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(project);
                    }}
                    aria-label="Edit project"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project);
                    }}
                    aria-label="Delete project"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.projectExtraInfo}>
                <span>
                  <FiCalendar size={14} />
                  Created on {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/projects/${project.id}`}
                  className={styles.viewButton}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiArrowRight size={14} /> View Project
                </Link>
              </div>
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

      {/* Add Column Modal */}
      {addColumnProject && (
        <Modal
          isOpen={!!addColumnProject}
          onClose={() => setAddColumnProject(null)}
          title="Add Column"
        >
          <AddColumnForm
            projectId={addColumnProject.id}
            onSuccess={() => setAddColumnProject(null)}
            onCancel={() => setAddColumnProject(null)}
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

      {/* Project Board Modal */}
      {viewBoardProject && (
        <Modal
          isOpen={!!viewBoardProject}
          onClose={() => setViewBoardProject(null)}
          title={`${viewBoardProject.name} - Board View`}
          size="large"
        >
          <ProjectBoard project={viewBoardProject} />
        </Modal>
      )}
    </>
  );
});

export default ProjectList;

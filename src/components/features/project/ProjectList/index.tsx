import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Project, ColumnType, ColumnFormData } from "../../../../types";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import Modal from "../../../ui/Modal";
import ProjectForm from "../ProjectForm";
import EditProjectForm from "./EditProjectForm";
import { projectStore, repositoryStore } from "../../../../store";
import { useToast } from "../../../ui/Toast";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCalendar,
  FiArrowRight,
  FiColumns,
  FiUsers,
  FiGithub,
} from "react-icons/fi";
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

const ProjectList: React.FC<ProjectListProps> = observer(({ projects }) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addColumnProject, setAddColumnProject] = useState<Project | null>(null);
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

              <div className={styles.projectDescription}>
                {project.description ? (
                  <p>{project.description}</p>
                ) : (
                  <p className={styles.emptyDescription}>No description provided</p>
                )}
              </div>

              <div className={styles.projectStats}>
                <div className={styles.stat}>
                  <FiGithub size={14} />
                  <span>{project.repositories?.length || 0} Repositories</span>
                </div>
                <div className={styles.stat}>
                  <FiUsers size={14} />
                  <span>{project.collaborators?.length || 0} Collaborators</span>
                </div>
              </div>

              <div className={styles.projectExtraInfo}>
                <span className={styles.projectExtraInfoDate}>
                  <FiCalendar size={14} />
                  <i>Created on {new Date(project.createdAt).toLocaleDateString()}</i>
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

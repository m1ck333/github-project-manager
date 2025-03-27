import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { projectStore } from "../../store";
import ProjectBoard from "../../components/features/ProjectBoard";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Container from "../../components/layout/Container";
import IssueForm from "../../components/features/IssueForm";
import LabelForm from "../../components/features/LabelForm";
import { FiArrowLeft, FiPlus, FiTag, FiColumns, FiUsers } from "react-icons/fi";
import styles from "./ProjectPage.module.scss";
import { ColumnType } from "../../types";

const ProjectPage: React.FC = observer(() => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        // If the project isn't in the store already, fetch it
        if (!projectStore.projects.find((p) => p.id === projectId)) {
          await projectStore.fetchProjects();
        }

        // Select the project
        projectStore.selectProject(projectId);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message || "Failed to load project");
        setIsLoading(false);
      }
    };

    fetchProject();

    // Clear selected project on unmount
    return () => {
      projectStore.clearSelectedProject();
    };
  }, [projectId]);

  const handleBack = () => {
    navigate("/projects");
  };

  if (isLoading) {
    return (
      <Container size="large" withPadding>
        <div className={styles.loading}>Loading project...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="large" withPadding>
        <div className={styles.error}>{error}</div>
      </Container>
    );
  }

  const project = projectStore.selectedProject;
  if (!project) {
    return (
      <Container size="large" withPadding>
        <div className={styles.error}>Project not found</div>
      </Container>
    );
  }

  return (
    <Container size="large" withPadding title={project.name}>
      <div className={styles.pageContent}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            <FiArrowLeft /> Back to Projects
          </button>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setShowColumnForm(true)}>
              <FiColumns /> Add Column
            </Button>
            <Button variant="secondary" onClick={() => setShowLabelForm(true)}>
              <FiTag /> Create Label
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/projects/${project.id}/collaborators`)}
            >
              <FiUsers /> Manage Collaborators
            </Button>
            <Button variant="primary" onClick={() => setShowIssueForm(true)}>
              <FiPlus /> New Issue
            </Button>
          </div>
        </div>

        <ProjectBoard project={project} />

        {/* Issue Creation Modal */}
        <Modal
          isOpen={showIssueForm}
          onClose={() => setShowIssueForm(false)}
          title="Create New Issue"
        >
          <IssueForm
            projectId={project.id}
            onSuccess={() => setShowIssueForm(false)}
            onCancel={() => setShowIssueForm(false)}
          />
        </Modal>

        {/* Label Creation Modal */}
        <Modal
          isOpen={showLabelForm}
          onClose={() => setShowLabelForm(false)}
          title="Create New Label"
        >
          <LabelForm
            projectId={project.id}
            onSuccess={() => setShowLabelForm(false)}
            onCancel={() => setShowLabelForm(false)}
          />
        </Modal>

        {/* Column Creation Modal */}
        <Modal isOpen={showColumnForm} onClose={() => setShowColumnForm(false)} title="Add Column">
          <SimpleColumnForm
            projectId={project.id}
            onSuccess={() => setShowColumnForm(false)}
            onCancel={() => setShowColumnForm(false)}
          />
        </Modal>
      </div>
    </Container>
  );
});

const SimpleColumnForm: React.FC<{
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}> = observer(({ projectId, onSuccess, onCancel }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<ColumnType>(ColumnType.TODO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Column name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await projectStore.addColumn(projectId, { name, type });
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Column Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter column name"
          className={styles.input}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="type">Column Type</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as ColumnType)}
          className={styles.select}
        >
          <option value={ColumnType.TODO}>To Do</option>
          <option value={ColumnType.IN_PROGRESS}>In Progress</option>
          <option value={ColumnType.DONE}>Done</option>
          <option value={ColumnType.BACKLOG}>Backlog</option>
        </select>
      </div>

      <div className={styles.actions}>
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

export default ProjectPage;

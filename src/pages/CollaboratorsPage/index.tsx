import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { projectStore } from "../../store";
import { Collaborator, CollaboratorRole, CollaboratorFormData } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { FiArrowLeft, FiPlus, FiUsers, FiTrash2 } from "react-icons/fi";
import styles from "./CollaboratorsPage.module.scss";

const CollaboratorsPage: React.FC = observer(() => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        // If the project isn't in the store already, fetch it
        if (!projectStore.projects.find((p) => p.id === projectId)) {
          await projectStore.fetchProjects();
        }

        // Select the project
        projectStore.selectProject(projectId);

        // Get collaborators
        if (projectStore.selectedProject?.collaborators) {
          setCollaborators(projectStore.selectedProject.collaborators);
        }

        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message || "Failed to load project");
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleAddCollaborator = async (data: CollaboratorFormData) => {
    if (!projectId) return;

    try {
      await projectStore.addCollaborator(projectId, data);

      // Refresh collaborators
      if (projectStore.selectedProject?.collaborators) {
        setCollaborators(projectStore.selectedProject.collaborators);
      }

      showToast(`Added ${data.username} as collaborator`, "success");
      setIsAddingCollaborator(false);
    } catch (err) {
      showToast(`Failed to add collaborator: ${(err as Error).message}`, "error");
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string, username: string) => {
    if (!projectId) return;

    if (confirm(`Are you sure you want to remove ${username} from this project?`)) {
      try {
        await projectStore.removeCollaborator(projectId, collaboratorId);

        // Refresh collaborators
        if (projectStore.selectedProject?.collaborators) {
          setCollaborators(projectStore.selectedProject.collaborators);
        }

        showToast(`Removed ${username} from project`, "success");
      } catch (err) {
        showToast(`Failed to remove collaborator: ${(err as Error).message}`, "error");
      }
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading collaborators...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const project = projectStore.selectedProject;
  if (!project) {
    return <div className={styles.error}>Project not found</div>;
  }

  return (
    <div className={styles.collaboratorsPage}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <FiArrowLeft /> Back to Project
        </button>
        <h1>{project.name} - Collaborators</h1>
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => setIsAddingCollaborator(true)}>
            <FiPlus /> Add Collaborator
          </Button>
        </div>
      </div>

      <div className={styles.collaboratorsList}>
        {collaborators.filter((c) => !c.isNote).length === 0 ? (
          <div className={styles.emptyState}>
            <FiUsers size={48} />
            <p>No collaborators yet. Add collaborators to work together on this project.</p>
          </div>
        ) : (
          collaborators.map((collaborator, index) => {
            // Skip note items in the main list
            if (collaborator.isNote) return null;

            const collaboratorKey = `collaborator-${index}-${collaborator.id || ""}-${collaborator.username}`;

            return (
              <div key={collaboratorKey} className={styles.collaboratorCard}>
                <div className={styles.collaboratorAvatar}>
                  {collaborator.isTeam ? (
                    <div className={styles.teamIcon}>
                      <FiUsers size={20} />
                    </div>
                  ) : (
                    <img
                      src={
                        collaborator.avatar ||
                        `https://avatars.githubusercontent.com/${collaborator.username}`
                      }
                      alt={collaborator.username}
                    />
                  )}
                </div>
                <div className={styles.collaboratorInfo}>
                  <h3>
                    {collaborator.username} {collaborator.isCurrentUser ? "(You)" : ""}
                  </h3>
                  <div className={styles.roleInfo}>
                    <span className={styles.role}>{collaborator.role}</span>
                    {collaborator.isOrganization && (
                      <span className={styles.badge}>Organization</span>
                    )}
                    {collaborator.isTeam && <span className={styles.badge}>Team</span>}
                  </div>
                </div>
                {!collaborator.isCurrentUser && (
                  <Button
                    variant="danger"
                    size="small"
                    iconOnly
                    onClick={() => handleRemoveCollaborator(collaborator.id, collaborator.username)}
                    className={styles.removeButton}
                  >
                    <FiTrash2 />
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Display notes about API limitations at the bottom */}
      <div className={styles.notesSection}>
        {collaborators
          .filter((c) => c.isNote)
          .map((note, index) => (
            <div
              key={`note-${index}`}
              className={`${styles.noteCard} ${note.username.includes("GitHub API Limitations") ? styles.headerNote : ""}`}
            >
              <p>{note.username}</p>
            </div>
          ))}
      </div>

      {/* Add Collaborator Modal */}
      <Modal
        isOpen={isAddingCollaborator}
        onClose={() => setIsAddingCollaborator(false)}
        title="Add Collaborator"
      >
        <AddCollaboratorForm
          onSubmit={handleAddCollaborator}
          onCancel={() => setIsAddingCollaborator(false)}
        />
      </Modal>
    </div>
  );
});

// Add Collaborator Form component
const AddCollaboratorForm: React.FC<{
  onSubmit: (data: CollaboratorFormData) => void;
  onCancel: () => void;
}> = observer(({ onSubmit, onCancel }) => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<CollaboratorRole>(CollaboratorRole.READ);
  const [errors, setErrors] = useState<{ username?: string; role?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!username.trim()) {
      setErrors({ username: "Username is required" });
      return;
    }

    try {
      setIsSubmitting(true);
      onSubmit({ username, role });
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ username: error.message });
      } else {
        setErrors({ username: "Failed to add collaborator" });
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
          className={styles.select}
        >
          <option value={CollaboratorRole.READ}>Read</option>
          <option value={CollaboratorRole.WRITE}>Write</option>
          <option value={CollaboratorRole.ADMIN}>Admin</option>
        </select>
      </div>

      <div className={styles.formActions}>
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

export default CollaboratorsPage;

import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiUser,
  FiUserX,
  FiUserPlus,
  FiGithub,
  FiExternalLink,
  FiLink,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { repositoryStore, projectStore } from "../../store";
import { Project } from "../../types";

import styles from "./RepositoryPage.module.scss";

// Simple Select component since we don't have one in the project
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
}

const Select: React.FC<SelectProps> = ({ id, value, onChange, options }) => {
  return (
    <select id={id} value={value} onChange={onChange} className={styles.select}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const RepositoryPage: React.FC = observer(() => {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState("");
  const [permission, setPermission] = useState<"read" | "write" | "admin">("read");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinkProjectModal, setShowLinkProjectModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLinkingProject, setIsLinkingProject] = useState(false);

  useEffect(() => {
    if (owner && name) {
      // Use a single loading operation
      repositoryStore.loading = true;

      // Fetch repository with collaborators in a single request
      repositoryStore
        .fetchRepository(owner, name)
        .catch((error) => console.error("Error loading repository data:", error))
        .finally(() => {
          repositoryStore.loading = false;
        });
    }
  }, [owner, name]);

  // Separate effect to fetch projects only when modal is opened
  useEffect(() => {
    if (showLinkProjectModal) {
      projectStore
        .fetchProjects()
        .then((projects) => {
          // Auto-select the first project if available and none selected
          if (projects && projects.length > 0) {
            // Always select the first project when modal opens for better UX
            setSelectedProjectId(projects[0].id);
          }
        })
        .catch((error) => console.error("Error fetching projects:", error));
    }
  }, [showLinkProjectModal]); // Remove selectedProjectId dependency to prevent circular updates

  useEffect(() => {
    document.title = `${name} | Repository`;
  }, [name]);

  const handleGoBack = () => {
    navigate("/repositories");
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner || !name || !username) return;

    setIsSubmitting(true);
    try {
      await repositoryStore.addRepositoryCollaborator(owner, name, { username, permission });
      setUsername("");
      setPermission("read");
      setShowAddForm(false);
      showToast("Collaborator added successfully", "success");
    } catch (error) {
      console.error("Error adding collaborator:", error);
      showToast(
        `Failed to add collaborator: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!owner || !name) return;

    try {
      await repositoryStore.removeRepositoryCollaborator(owner, name, collaboratorId);
      showToast("Collaborator removed successfully", "success");
    } catch (error) {
      console.error("Error removing collaborator:", error);
      showToast("Failed to remove collaborator", "error");
    }
  };

  const handleLinkToProject = async () => {
    if (!owner || !name) {
      showToast("Missing repository information", "error");
      return;
    }

    if (!selectedProjectId) {
      showToast("Please select a project first", "warning");
      return;
    }

    setIsLinkingProject(true);

    try {
      // Find the project to get its name for better UX
      const project = projectStore.projects.find((p) => p.id === selectedProjectId);

      const success = await projectStore.linkRepositoryToProject(selectedProjectId, owner, name);

      if (success) {
        showToast(`Successfully linked to ${project?.name || "project"}`, "success");

        // Close modal and reset
        setShowLinkProjectModal(false);
        setSelectedProjectId("");

        // Force project refresh (to ensure persistence)
        await projectStore.fetchProjects();
      } else {
        showToast("Failed to link repository to project", "error");
      }
    } catch (error) {
      console.error("Error linking repository to project:", error);
      showToast(
        `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        "error"
      );
    } finally {
      setIsLinkingProject(false);
    }
  };

  const repository = repositoryStore.repositories.find(
    (r) => r.owner.login === owner && r.name === name
  );

  if (repositoryStore.loading && !repository) {
    return (
      <Container size="medium" withPadding title="Loading Repository...">
        <div className={styles.loading}>Loading repository details...</div>
      </Container>
    );
  }

  if (repositoryStore.error) {
    return (
      <Container size="medium" withPadding title="Error">
        <div className={styles.error}>
          {repositoryStore.error}
          <Button variant="secondary" onClick={handleGoBack}>
            Go Back
          </Button>
        </div>
      </Container>
    );
  }

  if (!repository) {
    return (
      <Container size="medium" withPadding title="Repository Not Found">
        <div className={styles.notFound}>
          <p>The repository you're looking for doesn't exist or you don't have access to it.</p>
          <Button variant="secondary" onClick={handleGoBack}>
            Go Back to Repositories
          </Button>
        </div>
      </Container>
    );
  }

  const permissionOptions = [
    { value: "read", label: "Read" },
    { value: "write", label: "Write" },
    { value: "admin", label: "Admin" },
  ];

  return (
    <Container size="medium" withPadding title={repository.name}>
      <div className={styles.pageContent}>
        <div className={styles.header}>
          <Button variant="secondary" onClick={handleGoBack} className={styles.backButton}>
            <FiArrowLeft /> Back to Repositories
          </Button>
          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              onClick={() => setShowLinkProjectModal(true)}
              className={styles.linkButton}
            >
              <FiLink /> Link to Project
            </Button>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              <FiGithub /> View on GitHub <FiExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className={styles.repoInfo}>
          <div className={styles.repoOwner}>
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className={styles.ownerAvatar}
            />
            <span>{repository.owner.login}</span>
          </div>

          {repository.description && (
            <div className={styles.description}>
              <h3>Description</h3>
              <p>{repository.description}</p>
            </div>
          )}
        </div>

        <div className={styles.collaboratorsSection}>
          <div className={styles.sectionHeader}>
            <h2>Collaborators</h2>
            <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancel" : "Add Collaborator"}
            </Button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddCollaborator} className={styles.addForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username">GitHub Username</label>
                <Input
                  id="username"
                  placeholder="e.g., octocat"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="permission">Permission Level</label>
                <Select
                  id="permission"
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as "read" | "write" | "admin")}
                  options={permissionOptions}
                />
              </div>
              <Button type="submit" variant="primary" disabled={isSubmitting || !username}>
                {isSubmitting ? "Adding..." : "Add Collaborator"}
              </Button>
            </form>
          )}

          {repositoryStore.loading && (
            <div className={styles.loading}>Loading collaborators...</div>
          )}

          <div className={styles.collaboratorsList}>
            {repository.collaborators && repository.collaborators.length > 0 ? (
              repository.collaborators.map((collaborator) => (
                <div key={collaborator.id} className={styles.collaboratorCard}>
                  <div className={styles.collaboratorInfo}>
                    <img
                      src={collaborator.avatarUrl}
                      alt={collaborator.login}
                      className={styles.collaboratorAvatar}
                    />
                    <div className={styles.collaboratorDetails}>
                      <div className={styles.collaboratorName}>
                        <FiUser />
                        <span>{collaborator.login}</span>
                      </div>
                      <div className={styles.collaboratorPermission}>{collaborator.permission}</div>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    className={styles.removeButton}
                  >
                    <FiUserX /> Remove
                  </Button>
                </div>
              ))
            ) : (
              <div className={styles.emptyCollaborators}>
                <FiUserPlus size={32} />
                <p>
                  No collaborators found. Add collaborators to work together on this repository.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Project linking modal */}
        <Modal
          isOpen={showLinkProjectModal}
          onClose={() => setShowLinkProjectModal(false)}
          title="Link to Project"
        >
          <div className={styles.linkProjectForm}>
            <p>Select a project to link this repository to:</p>

            {projectStore.loading ? (
              <div className={styles.loading}>Loading projects...</div>
            ) : projectStore.projects.length === 0 ? (
              <div className={styles.noProjects}>
                <p>No projects found. Create a project first.</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowLinkProjectModal(false);
                    navigate("/projects");
                  }}
                >
                  Go to Projects
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.projectList}>
                  {projectStore.projects.map((project: Project) => (
                    <div
                      key={project.id}
                      className={`${styles.projectOption} ${selectedProjectId === project.id ? styles.selectedProject : ""}`}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <strong>{project.name}</strong>
                      <span>{project.id.substring(0, 8)}...</span>
                    </div>
                  ))}
                </div>

                <div className={styles.modalActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowLinkProjectModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleLinkToProject}
                    disabled={isLinkingProject || !selectedProjectId}
                  >
                    {isLinkingProject ? "Linking..." : "Link to Project"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </Container>
  );
});

export default RepositoryPage;

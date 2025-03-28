import { observer } from "mobx-react-lite";
import React, { useState, useEffect, useCallback } from "react";
import { FiGithub, FiTrash2, FiPlus } from "react-icons/fi";

import { projectStore } from "../../../../store";
import { Repository } from "../../../../types";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import Loading from "../../../ui/Loading";
import Modal from "../../../ui/Modal";

import styles from "./ProjectRepositories.module.scss";

interface ProjectRepositoriesProps {
  projectId: string;
}

const ProjectRepositories: React.FC<ProjectRepositoriesProps> = observer(({ projectId }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    try {
      const repos = await projectStore.getProjectRepositories(projectId);
      setRepositories(repos);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  const handleAddRepository = async () => {
    if (!owner || !repoName) return;

    setLoading(true);
    try {
      const success = await projectStore.linkRepositoryToProject(projectId, owner, repoName);
      if (success) {
        await loadRepositories();
        setOwner("");
        setRepoName("");
        setShowAddModal(false);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRepository = async (repositoryId: string) => {
    if (!confirm("Are you sure you want to unlink this repository?")) return;

    setLoading(true);
    try {
      await projectStore.unlinkRepositoryFromProject(projectId, repositoryId);
      await loadRepositories();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.projectRepositories}>
      <div className={styles.header}>
        <h3>Linked Repositories</h3>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <FiPlus /> Link Repository
        </Button>
      </div>

      {repositories.length === 0 && !loading && !error && (
        <div className={styles.noRepositories}>No repositories linked to this project.</div>
      )}
      {loading && <Loading size="medium" text="Loading repositories..." />}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.repositoriesList}>
        {repositories.length === 0 ? (
          <div className={styles.emptyState}>
            <FiGithub size={32} />
            <p>No repositories linked to this project yet.</p>
          </div>
        ) : (
          repositories.map((repo) => (
            <div key={repo.id} className={styles.repositoryItem}>
              <div className={styles.repoInfo}>
                <img
                  src={repo.owner.avatar_url}
                  alt={repo.owner.login}
                  className={styles.ownerAvatar}
                />
                <div className={styles.repoDetails}>
                  <h4>
                    {repo.owner.login}/{repo.name}
                  </h4>
                  {repo.description && <p>{repo.description}</p>}
                </div>
              </div>
              <div className={styles.actions}>
                <Button
                  variant="danger"
                  onClick={() => handleRemoveRepository(repo.id)}
                  title="Unlink repository"
                >
                  <FiTrash2 />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Link GitHub Repository"
        size="small"
      >
        <div className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="ownerInput">Repository Owner</label>
            <Input
              id="ownerInput"
              placeholder="e.g., facebook"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="repoInput">Repository Name</label>
            <Input
              id="repoInput"
              placeholder="e.g., react"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddRepository}
              disabled={loading || !owner || !repoName}
            >
              {loading ? "Linking..." : "Link Repository"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default ProjectRepositories;

import { observer } from "mobx-react-lite";
import React, { useState, useEffect, ChangeEvent } from "react";
import { FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import RepositoryCard from "../../components/features/respository/RepositoryCard";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import GridCardAdd from "../../components/ui/GridCardAdd";
import GridContainer from "../../components/ui/GridContainer";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { repositoryStore } from "../../store";
import { Repository } from "../../types";

import styles from "./RepositoriesPage.module.scss";

const RepositoriesPage: React.FC = observer(() => {
  const { repositories, loading, error } = repositoryStore;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [repoName, setRepoName] = useState("");
  const [repoDesc, setRepoDesc] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");
  const [deleteRepository, setDeleteRepository] = useState<Repository | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Repositories | GitHub Project Manager";
    // No need to fetch repositories as they're already loaded during app initialization
  }, []);

  const handleCreateRepository = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoName.trim()) {
      setNameError("Repository name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await repositoryStore.createRepository(repoName.trim(), repoDesc.trim(), visibility);

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create repository:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRepoName("");
    setRepoDesc("");
    setVisibility("PUBLIC");
    setNameError("");
  };

  const handleRefresh = () => {
    repositoryStore.fetchUserRepositories();
  };

  const handleRetry = () => {
    repositoryStore.clearError();
    repositoryStore.fetchUserRepositories();
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter repositories based on search query
  const filteredRepositories = repositories.filter(
    (repo: Repository) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false
  );

  // Handle repository deletion
  const handleDeleteRepository = (repository: Repository) => {
    setDeleteRepository(repository);
  };

  const navigateToRepository = (repository: Repository) => {
    navigate(`/repositories/${repository.owner.login}/${repository.name}`);
  };

  const confirmDelete = async () => {
    if (deleteRepository) {
      try {
        setIsDeleting(true);
        // Implement the actual deletion
        await repositoryStore.deleteRepository(deleteRepository.owner.login, deleteRepository.name);
        toast.toast.success(`Repository "${deleteRepository.name}" deleted successfully`);
        setDeleteRepository(null);
      } catch (error) {
        toast.toast.error(`Failed to delete repository: ${(error as Error).message}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Container size="large" withPadding title="Repositories">
      <GridContainer
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
        onRetry={handleRetry}
        loadingText="Loading repositories..."
        emptyState={
          <div className={styles.emptyState}>
            <FiGithub size={48} />
            <p>No repositories found. Create a repository to get started.</p>
          </div>
        }
      >
        <GridCardAdd label="Create Repository" onClick={() => setIsModalOpen(true)} />

        {filteredRepositories.map((repository: Repository) => (
          <RepositoryCard
            key={repository.id}
            repository={repository}
            onClick={() => navigateToRepository(repository)}
            onDelete={handleDeleteRepository}
          />
        ))}
      </GridContainer>

      {/* Create Repository Modal */}
      <Modal
        title="Create Repository"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
      >
        <form onSubmit={handleCreateRepository} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="repoName">Repository Name</label>
            <Input
              id="repoName"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="example-repo"
              error={nameError}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="repoDesc">Description (optional)</label>
            <Input
              id="repoDesc"
              value={repoDesc}
              onChange={(e) => setRepoDesc(e.target.value)}
              placeholder="A brief description of your repository"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Visibility</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={visibility === "PUBLIC"}
                  onChange={() => setVisibility("PUBLIC")}
                />
                Public
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={visibility === "PRIVATE"}
                  onChange={() => setVisibility("PRIVATE")}
                />
                Private
              </label>
            </div>
          </div>

          <div className={styles.infoBox}>
            <p>This will create a repository on GitHub.</p>
          </div>

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !repoName.trim()}>
              Create Repository
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteRepository && (
        <Modal
          isOpen={!!deleteRepository}
          onClose={() => !isDeleting && setDeleteRepository(null)}
          title="Delete Repository"
        >
          <ConfirmationDialog
            title="Delete Repository Confirmation"
            message={`Are you sure you want to delete repository "${deleteRepository.name}"?`}
            warningMessage="This action cannot be undone."
            confirmLabel={isDeleting ? "Deleting..." : "Delete Repository"}
            isSubmitting={isDeleting}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteRepository(null)}
            confirmVariant="danger"
          />
        </Modal>
      )}
    </Container>
  );
});

export default RepositoriesPage;

import { observer } from "mobx-react-lite";
import React, { useState, ChangeEvent } from "react";
import { FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import GridCardAdd from "@/common/components/composed/grid/GridCardAdd";
import GridContainer from "@/common/components/composed/grid/GridContainer";
import PageContainer from "@/common/components/layout/PageContainer";
import Button from "@/common/components/ui/Button";
import ConfirmationDialog from "@/common/components/ui/ConfirmationDialog";
import Input from "@/common/components/ui/Input";
import Modal from "@/common/components/ui/Modal";
import { useToast } from "@/common/components/ui/Toast";
import RepositoryCard from "@/features/respository/components/RepositoryCard";
import { repositoryStore } from "@/stores";

import { Repository } from "../../../../core/types";

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
  const [disableRepository, setDisableRepository] = useState<Repository | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

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

  // Handle repository disabling
  const handleDisableRepository = (repository: Repository) => {
    setDisableRepository(repository);
  };

  const navigateToRepository = (repository: Repository) => {
    navigate(`/repositories/${repository.owner.login}/${repository.name}`);
  };

  const confirmDisable = async () => {
    if (disableRepository) {
      try {
        setIsDisabling(true);
        // Implement the actual disabling using updateRepository mutation
        await repositoryStore.disableRepository(
          disableRepository.owner.login,
          disableRepository.name
        );
        toast.toast.success(`Repository "${disableRepository.name}" disabled successfully`);
        setDisableRepository(null);
      } catch (error) {
        toast.toast.error(`Failed to disable repository: ${(error as Error).message}`);
      } finally {
        setIsDisabling(false);
      }
    }
  };

  return (
    <PageContainer
      fluid={true}
      title="Repositories"
      isLoading={loading}
      error={error}
      loadingMessage="Loading repositories..."
    >
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
            onDisable={handleDisableRepository}
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

      {/* Disable Repository Confirmation Modal */}
      {disableRepository && (
        <Modal
          isOpen={!!disableRepository}
          onClose={() => !isDisabling && setDisableRepository(null)}
          title="Disable Repository"
        >
          <ConfirmationDialog
            title="Disable Repository Confirmation"
            description={`Are you sure you want to disable repository "${disableRepository.name}"? This will turn off issues, projects, wiki, and discussions.`}
            footer={
              <Button variant="danger" onClick={confirmDisable} disabled={isDisabling}>
                {isDisabling ? "Disabling..." : "Disable Repository"}
              </Button>
            }
            isOpen={!!disableRepository}
            onClose={() => !isDisabling && setDisableRepository(null)}
          />
        </Modal>
      )}
    </PageContainer>
  );
});

export default RepositoriesPage;

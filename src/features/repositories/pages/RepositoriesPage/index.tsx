import { observer } from "mobx-react-lite";
import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import GridCardAdd from "@/common/components/composed/grid/GridCardAdd";
import PageContainer from "@/common/components/layout/PageContainer";
import {
  Button,
  ConfirmationDialog,
  Input,
  Modal,
  Search,
  Typography,
  useToast,
  Code,
} from "@/common/components/ui";
import { getErrorMessage } from "@/common/utils/errors";
import { Repositories, Repository } from "@/features/repositories";
import RepositoryCard from "@/features/repositories/components/molecules/RepositoryCard";

import styles from "./RepositoriesPage.module.scss";

const RepositoriesPage: React.FC = observer(() => {
  const repositoryStore = Repositories.store;
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

  // Load repositories when component mounts
  useEffect(() => {
    if (repositories.length === 0 && !loading && !error) {
      Repositories.services.crud.fetchRepositories();
    }
  }, [repositories.length, loading, error]);

  const handleCreateRepository = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoName.trim()) {
      setNameError("Repository name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await Repositories.services.crud.createRepository(
        repoName.trim(),
        repoDesc.trim(),
        visibility
      );

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
    Repositories.services.crud.fetchRepositories();
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter repositories based on search query
  const filteredRepositories = Repositories.services.search.searchRepositories(searchQuery);

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
        // Use the CRUD service to disable the repository
        await Repositories.services.crud.disableRepository(disableRepository.id);
        toast.toast.success(`Repository "${disableRepository.name}" disabled successfully`);
        setDisableRepository(null);
      } catch (error) {
        toast.toast.error(`Failed to disable repository: ${getErrorMessage(error)}`);
      } finally {
        setIsDisabling(false);
      }
    }
  };

  return (
    <PageContainer
      fluid={true}
      title={
        <Typography variant="h1" component="h1" gutterBottom>
          Repositories
        </Typography>
      }
      isLoading={loading}
      error={error ? getErrorMessage(error) : null}
      loadingMessage="Loading repositories..."
    >
      <div className={styles.pageContent}>
        <Search
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onRefresh={handleRefresh}
          isLoading={loading}
          placeholder="Search repositories..."
          className={styles.search}
        />

        <div className={styles.gridContainer}>
          <GridCardAdd label="Create Repository" onClick={() => setIsModalOpen(true)} />

          {filteredRepositories.map((repository: Repository) => (
            <RepositoryCard
              key={repository.id}
              repository={repository}
              onClick={() => navigateToRepository(repository)}
              onDisable={handleDisableRepository}
            />
          ))}
        </div>

        {filteredRepositories.length === 0 && searchQuery && !loading && (
          <div className={styles.noResults}>
            <Typography variant="body1" color="secondary" align="center">
              No repositories found matching "{searchQuery}"
            </Typography>
          </div>
        )}
      </div>

      {/* Create Repository Modal */}
      <Modal
        title={<Typography variant="h2">Create Repository</Typography>}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
      >
        <form onSubmit={handleCreateRepository} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="repoName">
              <Typography variant="subtitle2">Repository Name</Typography>
            </label>
            <Input
              id="repoName"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="example-repo"
              error={nameError}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="repoDesc">
              <Typography variant="subtitle2">Description (optional)</Typography>
            </label>
            <Input
              id="repoDesc"
              value={repoDesc}
              onChange={(e) => setRepoDesc(e.target.value)}
              placeholder="A brief description of your repository"
            />
          </div>

          <div className={styles.formGroup}>
            <Typography variant="subtitle2" component="div" gutterBottom>
              Visibility
            </Typography>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={visibility === "PUBLIC"}
                  onChange={() => setVisibility("PUBLIC")}
                />
                <Typography variant="body2" component="span">
                  Public
                </Typography>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={visibility === "PRIVATE"}
                  onChange={() => setVisibility("PRIVATE")}
                />
                <Typography variant="body2" component="span">
                  Private
                </Typography>
              </label>
            </div>
          </div>

          <div className={styles.infoBox}>
            <Typography variant="body2" color="secondary">
              This will create a repository on GitHub.
            </Typography>
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
              {isSubmitting ? "Creating..." : "Create Repository"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Disable Repository Confirmation Modal */}
      {disableRepository && (
        <Modal
          isOpen={!!disableRepository}
          onClose={() => !isDisabling && setDisableRepository(null)}
          title={<Typography variant="h2">Disable Repository</Typography>}
        >
          <ConfirmationDialog
            title="Disable Repository Confirmation"
            description={
              <Typography variant="body1">
                Are you sure you want to disable repository <Code>{disableRepository.name}</Code>?
                This will turn off issues, projects, wiki, and discussions.
              </Typography>
            }
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

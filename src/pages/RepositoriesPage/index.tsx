import { observer } from "mobx-react-lite";
import React, { useEffect, useState, ReactNode } from "react";
import { FiGithub, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import RepositoryCard from "../../components/features/respository/RepositoryCard";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import GridCardAdd from "../../components/ui/GridCardAdd";
import GridContainer from "../../components/ui/GridContainer";
import InfoBox from "../../components/ui/InfoBox";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { env } from "../../config/env";
import { repositoryStore } from "../../store";
import { Repository } from "../../types";

import styles from "./RepositoriesPage.module.scss";

const RepositoriesPage: React.FC = observer(() => {
  const { repositories, loading, error } = repositoryStore;
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const _toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Your Repositories | GitHub Project Manager";
  }, []);

  const handleAddRepositoryClick = () => {
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRepositoryClick = (repo: Repository) => {
    navigate(`/repositories/${repo.owner.login}/${repo.name}`);
  };

  // Filter repositories by search query
  const filteredRepositories = searchQuery
    ? repositories.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.owner.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : repositories;

  const emptySearchResults = (
    <InfoBox variant="info" title="No Results">
      <p>No repositories found matching your search</p>
    </InfoBox>
  );

  let content: ReactNode;

  // Show error message if token is missing
  if (!env.githubToken) {
    content = (
      <InfoBox
        title="GitHub Token Missing"
        variant="error"
        icon={<FiAlertCircle />}
        className={styles.infoBox}
      >
        <p>
          Please add your GitHub token to the <code>.env</code> file to access your repositories.
        </p>
        <p className={styles.codeExample}>
          <code>REACT_APP_GITHUB_TOKEN=your_github_token</code>
        </p>
      </InfoBox>
    );
  }
  // Show loading state
  else if (loading) {
    content = <Loading text="Loading repositories..." />;
  }
  // Show error message
  else if (error) {
    content = (
      <InfoBox title="Error Loading Repositories" variant="error" icon={<FiAlertCircle />}>
        <p>{error}</p>
        <Button
          onClick={() => repositoryStore.clearError()}
          variant="secondary"
          className={styles.retryButton}
        >
          Dismiss
        </Button>
      </InfoBox>
    );
  }
  // Show empty state
  else if (repositories.length === 0) {
    content = (
      <InfoBox title="No Repositories Found" variant="info" icon={<FiGithub />}>
        <p>You don't have any GitHub repositories yet.</p>
        <Button onClick={handleAddRepositoryClick} variant="primary">
          Create Repository
        </Button>
      </InfoBox>
    );
  }
  // Show repositories grid
  else {
    content = (
      <GridContainer
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        title="Repositories"
        loading={loading}
        error={error}
        emptyState={emptySearchResults}
        loadingText="Loading repositories..."
      >
        {filteredRepositories.map((repository) => (
          <RepositoryCard
            key={repository.id}
            repository={repository}
            onClick={() => handleRepositoryClick(repository)}
          />
        ))}
        <GridCardAdd onClick={handleAddRepositoryClick} label="Create Repository" />
      </GridContainer>
    );
  }

  return (
    <Container title="Your Repositories">
      {content}

      <CreateRepositoryModal show={showAddModal} onClose={handleModalClose} />
    </Container>
  );
});

interface CreateRepositoryModalProps {
  show: boolean;
  onClose: () => void;
}

const CreateRepositoryModal: React.FC<CreateRepositoryModalProps> = observer(
  ({ show, onClose }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
    const [nameError, setNameError] = useState("");
    const _toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        setNameError("Repository name is required");
        return;
      }

      if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
        setNameError(
          "Repository name can only contain letters, numbers, hyphens, periods, and underscores"
        );
        return;
      }

      try {
        await repositoryStore.createRepository(name.trim(), description.trim(), visibility);
        _toast.showToast(`Repository ${name} was created successfully`, "success");
        onClose();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        _toast.showToast(`Error creating repository: ${errorMsg}`, "error");
      }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      setNameError("");
    };

    return (
      <Modal title="Create New Repository" isOpen={show} onClose={onClose}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Repository Name</label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. my-awesome-project"
              error={nameError}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description (optional)</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your repository"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Visibility</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === "PRIVATE"}
                  onChange={() => setVisibility("PRIVATE")}
                />
                <span>Private</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === "PUBLIC"}
                  onChange={() => setVisibility("PUBLIC")}
                />
                <span>Public</span>
              </label>
            </div>
          </div>

          <div className={styles.modalActions}>
            <Button onClick={onClose} variant="secondary" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Repository
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
);

export default RepositoriesPage;

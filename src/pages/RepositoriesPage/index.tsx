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
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [repoName, setRepoName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRepository, setEditRepository] = useState<Repository | null>(null);
  const [deleteRepository, setDeleteRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [error, setError] = useState<ReactNode | null>(null);
  const [creating, setCreating] = useState(false);
  const [repoDescription, setRepoDescription] = useState("");
  const [repoVisibility, setRepoVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

  useEffect(() => {
    document.title = "Repositories | Project Manager";

    // Fetch the authenticated user's username
    const fetchCurrentUser = async () => {
      if (!env.githubToken) return;

      setFetchingUser(true);
      try {
        const response = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `bearer ${env.githubToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `query { viewer { login } }`,
          }),
        });

        if (response.ok) {
          const { data } = await response.json();
          if (data && data.viewer) {
            setCurrentUser(data.viewer.login);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setFetchingUser(false);
      }
    };

    const loadRepositories = async () => {
      try {
        // Initialize all repository data in a single operation
        await repositoryStore.initializeData();
      } catch (error) {
        console.error("Error loading repositories:", error);
      }
    };

    fetchCurrentUser();
    loadRepositories();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const validateRepoName = (name: string): boolean => {
    // Repository names can't have spaces and must follow GitHub naming rules
    const validNamePattern = /^[a-zA-Z0-9._-]+$/;
    return validNamePattern.test(name);
  };

  const handleCreateRepository = async () => {
    if (!repoName || !currentUser) return;

    // Check if the repo name contains a slash, which might indicate "owner/name" format
    let repoOwner = currentUser;
    let repoNameToUse = repoName;

    if (repoName.includes("/")) {
      const parts = repoName.split("/");
      if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
        repoOwner = parts[0].trim();
        repoNameToUse = parts[1].trim();
      } else {
        setError(
          "Invalid repository format. Use either 'repository-name' or 'owner/repository-name'."
        );
        return;
      }
    }

    // Validate repository name
    if (!validateRepoName(repoNameToUse)) {
      setError(
        "Repository name can only contain letters, numbers, hyphens, underscores, and periods."
      );
      return;
    }

    setCreating(true);
    try {
      // If the owner is different from the current user, show an error
      // as users can only create repositories under their own account
      if (repoOwner !== currentUser) {
        setError(
          `You can only create repositories under your own account (${currentUser}). To create a repository under ${repoOwner}, please log in as that user.`
        );
        setCreating(false);
        return;
      }

      const repository = await repositoryStore.createRepository(
        repoNameToUse,
        repoDescription,
        repoVisibility
      );

      if (repository) {
        setShowAddModal(false);
        setRepoName("");
        setRepoDescription("");
        setError(null);
      } else {
        setError("Failed to create repository. Please try again.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Error creating repository: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleAddRepository = async () => {
    if (!repoName || !currentUser) return;

    // Reset error state
    setError(null);

    // Check if the repo name contains a slash, which might indicate "owner/name" format
    let repoOwner = currentUser;
    let repoNameToUse = repoName;

    if (repoName.includes("/")) {
      const parts = repoName.split("/");
      if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
        repoOwner = parts[0].trim();
        repoNameToUse = parts[1].trim();
      } else {
        setError(
          "Invalid repository format. Use either 'repository-name' or 'owner/repository-name'."
        );
        return;
      }
    }

    // Validate repository name
    if (!validateRepoName(repoNameToUse)) {
      setError(
        "Repository name can only contain letters, numbers, hyphens, underscores, and periods."
      );
      return;
    }

    setIsLoading(true);
    try {
      const repository = await repositoryStore.fetchRepository(repoOwner, repoNameToUse);
      if (repository) {
        // Success, clear the form
        setRepoName("");
        setShowAddModal(false);
      } else {
        setError(
          <>
            Repository{" "}
            <strong>
              {repoOwner}/{repoNameToUse}
            </strong>{" "}
            not found.
            <div className={styles.errorActions}>
              <span>Would you like to </span>
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  // Show create form
                  setError(null);
                  document.getElementById("repoDescriptionInput")?.focus();
                }}
              >
                create this repository
              </Button>
              <span> directly in this app?</span>
            </div>
            <div className={styles.errorActions}>
              <span>Or </span>
              <a
                href={`https://github.com/new?owner=${repoOwner}&name=${repoNameToUse}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                create it on GitHub
              </a>
            </div>
          </>
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Error adding repository: ${errorMessage}`);
      console.error("Error adding repository:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepositoryClick = (owner: string, name: string) => {
    navigate(`/repositories/${owner}/${name}`);
  };

  const handleEditRepository = (repository: Repository) => {
    // For now, this is just a placeholder. In a real implementation,
    // you would set the edit repository state and show an edit modal
    setEditRepository(repository);
    toast.showToast(`Editing repository ${repository.name} is not fully implemented yet.`, "info");
  };

  const handleDeleteRepository = (repository: Repository) => {
    // Set the repository to delete and show a confirmation
    setDeleteRepository(repository);
    toast.showToast(
      `Deleting repositories through GitHub API is not supported. You'll need to delete the repository on GitHub directly.`,
      "warning"
    );
  };

  const handleRefresh = async () => {
    try {
      // Force refresh by setting initialized to false
      repositoryStore.resetInitialization();
      await repositoryStore.initializeData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const filteredRepositories = repositoryStore.repositories.filter((repository) => {
    return (
      repository.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repository.owner.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repository.description &&
        repository.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <Container size="large" withPadding title="Repositories">
      <GridContainer
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
        loading={repositoryStore.loading}
        error={repositoryStore.error}
      >
        <GridCardAdd
          label="Add Repository"
          onClick={() => setShowAddModal(true)}
          className={styles.addCard}
        />

        {filteredRepositories.map((repository) => (
          <RepositoryCard
            key={repository.id}
            repository={repository}
            onClick={() => handleRepositoryClick(repository.owner.login, repository.name)}
            onEdit={handleEditRepository}
            onDelete={handleDeleteRepository}
          />
        ))}
      </GridContainer>

      {/* Add Repository Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setError(null);
          setRepoName("");
          setRepoDescription("");
        }}
        title="Add Your GitHub Repository"
        size="small"
      >
        <div className={styles.modalForm}>
          {fetchingUser ? (
            <Loading size="small" text="Checking authentication..." fixedHeight />
          ) : !currentUser ? (
            <InfoBox variant="warning" title="Authentication Required">
              No GitHub user detected. Please ensure you have a valid GitHub token.
            </InfoBox>
          ) : (
            <InfoBox variant="info">
              Adding repository for user: <strong>{currentUser}</strong>
            </InfoBox>
          )}

          {error && (
            <InfoBox variant="error" title="Repository Error">
              {error}
            </InfoBox>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="repoInput">Repository name</label>
            <Input
              id="repoInput"
              placeholder="e.g., my-awesome-project or owner/repo-name"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
            <small className={styles.formHelp}>
              <FiAlertCircle size={12} /> Repository names can't contain spaces. You can enter
              either your own repo name or owner/repo-name format.
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="repoDescriptionInput">Description (optional)</label>
            <Input
              id="repoDescriptionInput"
              placeholder="Description of your repository"
              value={repoDescription}
              onChange={(e) => setRepoDescription(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Visibility</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={repoVisibility === "PRIVATE"}
                  onChange={() => setRepoVisibility("PRIVATE")}
                />
                Private
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={repoVisibility === "PUBLIC"}
                  onChange={() => setRepoVisibility("PUBLIC")}
                />
                Public
              </label>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setError(null);
                setRepoName("");
                setRepoDescription("");
              }}
            >
              Cancel
            </Button>

            {repoDescription || repoVisibility === "PUBLIC" ? (
              <Button
                variant="primary"
                onClick={handleCreateRepository}
                disabled={creating || !repoName || !currentUser}
              >
                {creating ? "Creating..." : "Create Repository"}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleAddRepository}
                disabled={isLoading || !repoName || !currentUser}
              >
                {isLoading ? "Adding..." : "Add Repository"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </Container>
  );
});

export default RepositoriesPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Repository } from "../../types";
import { repositoryStore, projectStore } from "../../store";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import ProjectListSelector from "../../components/features/project/ProjectListSelector";
import RepositoryCard from "../../components/RepositoryCard";
import { FiGithub, FiPlus } from "react-icons/fi";
import styles from "./RepositoriesPage.module.scss";

const RepositoriesPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedRepositoryForLinking, setSelectedRepositoryForLinking] =
    useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Repositories | Project Manager";

    const loadRepositories = async () => {
      try {
        // Fetch repositories if not already loaded
        if (repositoryStore.repositories.length === 0 && !repositoryStore.loading) {
          await repositoryStore.fetchUserRepositories();

          // Once repositories are loaded, fetch collaborators for each repository
          await Promise.all(
            repositoryStore.repositories.map(async (repo) => {
              if (!repo.collaborators || repo.collaborators.length === 0) {
                await repositoryStore.fetchRepositoryCollaborators(repo.owner.login, repo.name);
              }
            })
          );
        } else if (repositoryStore.repositories.length > 0) {
          // If we already have repositories, just fetch missing collaborators
          await Promise.all(
            repositoryStore.repositories.map(async (repo) => {
              if (!repo.collaborators || repo.collaborators.length === 0) {
                await repositoryStore.fetchRepositoryCollaborators(repo.owner.login, repo.name);
              }
            })
          );
        }
      } catch (error) {
        console.error("Error loading repositories:", error);
      }
    };

    loadRepositories();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddRepository = async () => {
    if (!owner || !repoName) return;

    setIsLoading(true);
    try {
      const repository = await repositoryStore.fetchRepository(owner, repoName);
      if (repository) {
        // Success, clear the form
        setOwner("");
        setRepoName("");
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Error adding repository:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepositoryClick = (owner: string, name: string) => {
    navigate(`/repositories/${owner}/${name}`);
  };

  const handleLinkToProject = async (projectId: string) => {
    if (!selectedRepositoryForLinking) return;

    setIsLoading(true);
    try {
      await projectStore.linkRepositoryToProject(
        projectId,
        selectedRepositoryForLinking.owner.login,
        selectedRepositoryForLinking.name
      );
      setShowLinkModal(false);
      setSelectedRepositoryForLinking(null);
    } catch (error) {
      console.error("Error linking repository to project:", error);
    } finally {
      setIsLoading(false);
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
      <div className={styles.pageContent}>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {repositoryStore.loading && <div className={styles.loading}>Loading repositories...</div>}

        {repositoryStore.error && <div className={styles.error}>{repositoryStore.error}</div>}

        <div className={styles.repositoriesList}>
          {/* Add Repository Card */}
          <div className={styles.addCard} onClick={() => setShowAddModal(true)}>
            <div className={styles.addIcon}>
              <FiPlus size={24} />
            </div>
            <p>Add Repository</p>
          </div>

          {filteredRepositories.length === 0 ? (
            <div className={styles.emptyState}>
              <FiGithub size={48} />
              <p>No repositories found. Add a repository to get started.</p>
            </div>
          ) : (
            filteredRepositories.map((repository) => (
              <RepositoryCard
                key={repository.id}
                repository={repository}
                onClick={() => handleRepositoryClick(repository.owner.login, repository.name)}
                onLinkToProject={(repo) => {
                  setSelectedRepositoryForLinking(repo);
                  setShowLinkModal(true);
                }}
              />
            ))
          )}
        </div>

        {/* Add Repository Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add GitHub Repository"
          size="small"
        >
          <div className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label htmlFor="ownerInput">Owner (username or organization)</label>
              <Input
                id="ownerInput"
                placeholder="e.g., facebook"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="repoInput">Repository name</label>
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
                disabled={isLoading || !owner || !repoName}
              >
                {isLoading ? "Adding..." : "Add Repository"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Link to Project Modal */}
        <Modal
          isOpen={showLinkModal}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedRepositoryForLinking(null);
          }}
          title="Link Repository to Project"
          size="small"
        >
          {selectedRepositoryForLinking && (
            <div className={styles.modalForm}>
              <p>
                Select a project to link repository{" "}
                <strong>
                  {selectedRepositoryForLinking.owner.login}/{selectedRepositoryForLinking.name}
                </strong>{" "}
                to:
              </p>
              <ProjectListSelector
                repositoryId={selectedRepositoryForLinking.id}
                onSelect={handleLinkToProject}
                onCancel={() => {
                  setShowLinkModal(false);
                  setSelectedRepositoryForLinking(null);
                }}
              />
            </div>
          )}
        </Modal>
      </div>
    </Container>
  );
});

export default RepositoriesPage;

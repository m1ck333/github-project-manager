import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FiGithub, FiTrash2, FiPlus } from "react-icons/fi";

import {
  Button,
  EmptyState,
  Error,
  FormActionButtons,
  FormGroup,
  Input,
  Loading,
  ModalForm,
} from "@/common/components/ui";
import { useAsync } from "@/common/hooks";
import { createError } from "@/common/utils/errors";
import { Repository } from "@/core/types";
import { appInitializationService } from "@/services/app-init.service";
import { projectStore } from "@/stores";

import styles from "./ProjectRepositories.module.scss";

interface ProjectRepositoriesProps {
  projectId: string;
}

const ProjectRepositories = observer(({ projectId }: ProjectRepositoriesProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");

  // Use our simplified async hook
  const { isLoading, error, execute, resetError } = useAsync();

  // Get repositories from the project
  const repositories = appInitializationService.getRepositories();

  const handleAddRepository = async () => {
    const success = await execute(async () => {
      const result = await projectStore.linkRepositoryToProject(projectId, owner, repoName);

      if (result) {
        setShowAddModal(false);
        setOwner("");
        setRepoName("");
      } else {
        throw createError("Failed to link repository");
      }

      return result;
    });

    // If successful, refresh the project data
    if (success) {
      await execute(() => projectStore.fetchProjects());
    }
  };

  const handleRemoveRepository = async (repositoryId: string) => {
    await execute(async () => {
      const repository = repositories.find((r: Repository) => r.id === repositoryId);
      if (!repository) {
        throw createError("Repository not found");
      }

      if (!repository.owner?.login || !repository.name) {
        throw createError("Repository owner or name is missing");
      }

      // Call the linkRepositoryToProject method
      const success = await projectStore.linkRepositoryToProject(
        projectId,
        repository.owner.login,
        repository.name
      );

      if (!success) {
        throw createError("Failed to unlink repository");
      }

      // Refresh project data
      await projectStore.fetchProjects();
    });
  };

  return (
    <div className={styles.projectRepositories}>
      <div className={styles.header}>
        <h3>Linked Repositories</h3>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <FiPlus /> Link Repository
        </Button>
      </div>

      {repositories.length === 0 && !isLoading && !error && (
        <div className={styles.noRepositories}>No repositories linked to this project.</div>
      )}
      {isLoading && <Loading size="medium" text="Loading repositories..." />}
      {error && <Error error={error} onRetry={resetError} />}

      <div className={styles.repositoriesList}>
        {repositories.length === 0 ? (
          <EmptyState
            icon={<FiGithub size={32} />}
            description="No repositories linked to this project yet."
          />
        ) : (
          repositories.map((repo: Repository) => (
            <div key={repo.id} className={styles.repositoryItem}>
              <div className={styles.repoInfo}>
                <div className={styles.repositoryAvatar}>
                  {repo.owner && (
                    <img
                      src={`https://github.com/${repo.owner.login}.png`}
                      alt={repo.owner.login}
                    />
                  )}
                </div>
                <div className={styles.repoDetails}>
                  <h4>
                    {repo.owner?.login}/{repo.name}
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

      <ModalForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Link GitHub Repository"
        size="small"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddRepository();
          }}
        >
          <FormGroup label="Repository Owner" htmlFor="ownerInput">
            <Input
              id="ownerInput"
              placeholder="e.g., facebook"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </FormGroup>
          <FormGroup label="Repository Name" htmlFor="repoInput">
            <Input
              id="repoInput"
              placeholder="e.g., react"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
          </FormGroup>
          <FormActionButtons
            onCancel={() => setShowAddModal(false)}
            isSubmitting={isLoading}
            submitDisabled={!owner || !repoName}
            submitText="Link Repository"
            submittingText="Linking..."
            cancelText="Cancel"
          />
        </form>
      </ModalForm>
    </div>
  );
});

export default ProjectRepositories;

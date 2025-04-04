import { observer } from "mobx-react-lite";
import { useState } from "react";

import {
  Button,
  EmptyState,
  Error,
  FormActionButtons,
  FormGroup,
  Input,
  Loading,
  Modal,
} from "@/common/components/ui";
import { useAsync } from "@/common/hooks";

import styles from "./project-repositories.module.scss";

interface ProjectRepositoriesProps {
  projectId: string;
}

// Define a simplified Repository interface here to avoid import issues
interface Repository {
  id: string;
  name: string;
  description?: string;
  owner?: {
    login: string;
  };
}

/**
 * ProjectRepositories component
 * @param {ProjectRepositoriesProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const ProjectRepositories = observer(({ projectId }: ProjectRepositoriesProps): JSX.Element => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");

  // Use our simplified async hook
  const { isLoading, error, execute, resetError } = useAsync();

  // Get repositories from the project - currently hardcoded empty array
  // Will be replaced with actual data fetching logic
  const repositories: Repository[] = [];

  const handleAddRepository = async () => {
    try {
      await execute(async () => {
        console.log(`Link repository ${owner}/${repoName} to project ${projectId}`);
        setShowAddModal(false);
        setOwner("");
        setRepoName("");
      });
    } catch (error) {
      console.error("Failed to link repository:", error);
    }
  };

  return (
    <div className={styles.projectRepositories}>
      <div className={styles.header}>
        <h3>Linked Repositories</h3>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Link Repository
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
            icon={<span>📚</span>}
            description="No repositories linked to this project yet."
          />
        ) : (
          repositories.map((repo: Repository) => (
            <div key={repo.id} className={styles.repositoryItem}>
              <div className={styles.repoDetails}>
                <h4>
                  {repo.owner?.login}/{repo.name}
                </h4>
                {repo.description && <p>{repo.description}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Link GitHub Repository"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddRepository();
          }}
        >
          {error && <div className={styles.error}>{String(error)}</div>}

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
      </Modal>
    </div>
  );
});

export default ProjectRepositories;

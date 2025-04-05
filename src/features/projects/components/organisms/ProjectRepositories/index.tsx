import { useState, memo } from "react";

import { Button, FormGroup, Input, Loading, Modal } from "@/common/components/ui";
import EmptyState from "@/common/components/ui/display/EmptyState";
import Typography from "@/common/components/ui/display/Typography";
import Error from "@/common/components/ui/feedback/Error";
import FormActionButtons from "@/common/components/ui/form/FormActionButtons";
import { useAsync } from "@/common/hooks";

import styles from "./project-repositories.module.scss";

/**
 * ProjectRepositories displays a list of GitHub repositories linked to a project
 * and provides functionality to add new repository links
 */
interface ProjectRepositoriesProps {
  projectId: string;
}

/**
 * Repository represents the minimal data needed for a repo in this context
 */
interface Repository {
  id: string;
  name: string;
  description?: string;
  owner?: {
    login: string;
  };
}

const ProjectRepositoriesComponent = ({ projectId }: ProjectRepositoriesProps) => {
  // State for the add repository modal
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
        <Typography variant="h3">Linked Repositories</Typography>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Link Repository
        </Button>
      </div>

      {repositories.length === 0 && !isLoading && !error && (
        <Typography variant="body1" className={styles.noRepositories}>
          No repositories linked to this project.
        </Typography>
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
                <Typography variant="h4">
                  {repo.owner?.login}/{repo.name}
                </Typography>
                {repo.description && <Typography variant="body2">{repo.description}</Typography>}
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
          {error && (
            <Typography variant="body2" className={styles.error}>
              {String(error)}
            </Typography>
          )}

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
};

const ProjectRepositories = memo(ProjectRepositoriesComponent);
ProjectRepositories.displayName = "ProjectRepositories";

export default ProjectRepositories;

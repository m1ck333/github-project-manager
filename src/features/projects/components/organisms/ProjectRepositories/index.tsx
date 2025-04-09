import { observer } from "mobx-react-lite";
import { memo } from "react";

import { Button, Loading } from "@/common/components/ui";
import EmptyState from "@/common/components/ui/display/EmptyState";
import Typography from "@/common/components/ui/display/Typography";
import Error from "@/common/components/ui/feedback/Error";
import { ColumnHeader, ProjectRepo } from "@/features/projects/components/atoms";
import { LinkRepositoryModal } from "@/features/projects/components/modals";
import { useProjectRepositories } from "@/features/projects/hooks/use-project-repositories";

import styles from "./project-repositories.module.scss";

interface ProjectRepositoriesProps {
  projectId: string;
}

const ProjectRepositoriesComponent = ({ projectId }: ProjectRepositoriesProps) => {
  const {
    repositories,
    showAddModal,
    setShowAddModal,
    owner,
    repoName,
    handleUnlinkRepository,
    handleSubmitLinkForm,
    isLoading,
    error,
    resetError,
  } = useProjectRepositories({ projectId });

  // Action button for adding repository
  const addRepoButton = (
    <Button variant="primary" onClick={() => setShowAddModal(true)}>
      Link Repository
    </Button>
  );

  return (
    <div className={styles.projectRepositories}>
      <ColumnHeader title="Linked Repositories" actions={addRepoButton} className={styles.header} />

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
          repositories.map((repo) => (
            <ProjectRepo key={repo.id} repo={repo} onUnlink={handleUnlinkRepository} />
          ))
        )}
      </div>

      {/* Link Repository Modal */}
      <LinkRepositoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitLinkForm}
        isLoading={isLoading}
        error={error ? String(error) : null}
        owner={owner}
        repoName={repoName}
      />
    </div>
  );
};

// Use observer to react to store changes
const ProjectRepositories = memo(observer(ProjectRepositoriesComponent));
ProjectRepositories.displayName = "ProjectRepositories";

export default ProjectRepositories;

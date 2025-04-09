import React from "react";
import { FiX } from "react-icons/fi";

import { Stack } from "@/common/components/ui/display/Stack";
import Typography from "@/common/components/ui/display/Typography";
import { ProjectAction, ProjectBadge } from "@/features/projects/components/atoms";
import { Repository } from "@/features/projects/hooks/use-project-repositories";

import styles from "./project-repo.module.scss";

interface ProjectRepoProps {
  repo: Repository;
  onUnlink: (repoId: string) => void;
  className?: string;
}

/**
 * Atomic component for displaying a single repository in a project
 */
const ProjectRepo: React.FC<ProjectRepoProps> = ({ repo, onUnlink, className = "" }) => {
  return (
    <div className={`${styles.repositoryItem} ${className}`}>
      <Stack direction="row" align="spread" cross="center" className={styles.repoDetails}>
        <Stack direction="column" spacing={1}>
          <Typography variant="h4">
            {repo.owner?.login}/{repo.name}
          </Typography>
          {repo.description && <Typography variant="body2">{repo.description}</Typography>}
        </Stack>
        <Stack direction="row" align="center" spacing={1}>
          {repo.owner && <ProjectBadge label={repo.owner.login} variant="primary" size="small" />}
          <ProjectAction
            icon={<FiX size={16} />}
            label="Unlink repository"
            onClick={() => onUnlink(repo.id)}
            variant="danger"
            title="Unlink this repository from the project"
          />
        </Stack>
      </Stack>
    </div>
  );
};

export default ProjectRepo;

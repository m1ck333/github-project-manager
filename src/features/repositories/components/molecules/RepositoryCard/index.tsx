import React, { useEffect, useState } from "react";
import { FiUsers, FiEdit, FiPower } from "react-icons/fi";

import GridCard from "@/common/components/composed/grid/GridCard";
import { Loading, Typography } from "@/common/components/ui";
import { Repository, Repositories } from "@/features/repositories";

import styles from "./repository-card.module.scss";

interface RepositoryCardProps {
  repository: Repository;
  onClick: () => void;
  onEdit?: (repository: Repository) => void;
  onDisable?: (repository: Repository) => void;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  onClick,
  onEdit,
  onDisable,
}) => {
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);

  // Fetch collaborators on mount if not already loaded
  useEffect(() => {
    const { collaborators, name, owner } = repository;

    if (collaborators === undefined && !isLoadingCollaborators) {
      setIsLoadingCollaborators(true);
      Repositories.store
        .fetchRepositoryCollaborators(owner.login, name)
        .then(() => setIsLoadingCollaborators(false))
        .catch((error: Error) => {
          console.error("Error fetching collaborators:", error);
          setIsLoadingCollaborators(false);
        });
    }
  }, [repository, isLoadingCollaborators]);

  // Handle collaborators - might be undefined or empty array
  const collaboratorCount = repository.collaborators?.length || 0;
  const collaboratorText =
    collaboratorCount > 0 ? (
      <Typography variant="body2" component="span">
        {collaboratorCount} Collaborators
      </Typography>
    ) : repository.collaborators === undefined && isLoadingCollaborators ? (
      <Loading size="small" text="" />
    ) : (
      <Typography variant="body2" component="span">
        No collaborators
      </Typography>
    );

  // Build the actions array conditionally
  const cardActions = [];

  if (onEdit) {
    cardActions.push({
      icon: <FiEdit size={16} />,
      label: "Edit",
      ariaLabel: "Edit repository",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(repository);
      },
    });
  }

  if (onDisable) {
    cardActions.push({
      icon: <FiPower size={16} />,
      label: "Disable",
      ariaLabel: "Disable repository",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onDisable(repository);
      },
    });
  }

  return (
    <GridCard
      title={repository.name}
      subtitle={repository.owner.login}
      description={repository.description || "No description provided"}
      avatar={{
        src: repository.owner.avatar_url,
        alt: repository.owner.login,
      }}
      stats={[
        {
          icon: <FiUsers size={14} />,
          text: collaboratorText,
        },
      ]}
      actions={cardActions.length > 0 ? cardActions : undefined}
      createdAt={repository.createdAt}
      htmlUrl={repository.html_url}
      viewPath={`/repositories/${repository.owner.login}/${repository.name}`}
      onClick={onClick}
      className={styles.repositoryCard}
    />
  );
};

export default RepositoryCard;

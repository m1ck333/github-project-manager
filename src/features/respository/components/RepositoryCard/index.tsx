import React, { useEffect, useState } from "react";
import { FiUsers, FiEdit, FiPower } from "react-icons/fi";

import GridCard from "../../../../common/components/composed/grid/GridCard";
import Loading from "../../../../common/components/ui/Loading";
import { repositoryStore } from "../../../../stores";
import { Repository } from "../../../../types";

import styles from "./RepositoryCard.module.scss";

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
    if (repository.collaborators === undefined && !isLoadingCollaborators) {
      setIsLoadingCollaborators(true);
      repositoryStore
        .fetchRepositoryCollaborators(repository.owner.login, repository.name)
        .then(() => setIsLoadingCollaborators(false))
        .catch((error) => {
          console.error("Error fetching collaborators:", error);
          setIsLoadingCollaborators(false);
        });
    }
  }, [repository.id, repository.collaborators]);

  // Handle collaborators - might be undefined or empty array
  const collaboratorCount = repository.collaborators?.length || 0;
  const collaboratorText =
    collaboratorCount > 0 ? (
      `${collaboratorCount} Collaborators`
    ) : repository.collaborators === undefined && isLoadingCollaborators ? (
      <Loading size="small" text="" />
    ) : (
      "No collaborators"
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

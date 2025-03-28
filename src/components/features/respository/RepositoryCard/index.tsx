import React, { useEffect, useState } from "react";
import { FiUsers, FiEdit, FiTrash2 } from "react-icons/fi";

import { repositoryStore } from "../../../../store";
import { Repository } from "../../../../types";
import GridCard from "../../../ui/GridCard";
import Loading from "../../../ui/Loading";

import styles from "./RepositoryCard.module.scss";

interface RepositoryCardProps {
  repository: Repository;
  onClick: () => void;
  onEdit?: (repository: Repository) => void;
  onDelete?: (repository: Repository) => void;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  onClick,
  onEdit,
  onDelete,
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

  if (onDelete) {
    cardActions.push({
      icon: <FiTrash2 size={16} />,
      label: "Delete",
      ariaLabel: "Delete repository",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(repository);
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

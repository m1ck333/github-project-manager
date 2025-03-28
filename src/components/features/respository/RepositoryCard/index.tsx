import React from "react";
import { FiUsers, FiEdit, FiTrash2 } from "react-icons/fi";

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
  // Handle collaborators - might be undefined or empty array
  const collaboratorCount = repository.collaborators?.length || 0;
  const collaboratorText =
    collaboratorCount > 0 ? (
      `${collaboratorCount} Collaborators`
    ) : repository.collaborators === undefined ? (
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

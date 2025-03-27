import React from "react";
import { Repository } from "../../types";
import { FiUsers, FiCode, FiLink, FiClock } from "react-icons/fi";
import styles from "./RepositoryCard.module.scss";

interface RepositoryCardProps {
  repository: Repository;
  onClick: () => void;
  onLinkToProject: (repository: Repository) => void;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  onClick,
  onLinkToProject,
}) => {
  // Format the creation date if available
  const formattedDate = repository.createdAt
    ? new Date(repository.createdAt).toLocaleDateString()
    : "Unknown date";

  return (
    <div className={styles.repositoryCard} onClick={onClick}>
      <div className={styles.repoHeader}>
        <div className={styles.repoOwner}>
          <img
            src={repository.owner.avatar_url}
            alt={repository.owner.login}
            className={styles.ownerAvatar}
          />
          <span>{repository.owner.login}</span>
        </div>
        <h3 className={styles.repoName}>{repository.name}</h3>
      </div>

      {repository.description && <p className={styles.repoDescription}>{repository.description}</p>}

      <div className={styles.repoStats}>
        <div className={styles.statItem}>
          <FiUsers />
          <span>{repository.collaborators?.length || 0} Collaborators</span>
        </div>
        <div className={styles.statItem}>
          <FiClock />
          <span>Created: {formattedDate}</span>
        </div>
        <div className={styles.statItem}>
          <FiCode />
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            View on GitHub
          </a>
        </div>
        <div className={styles.statItem}>
          <FiLink />
          <a
            href="#"
            onClick={(e) => {
              e.stopPropagation();
              onLinkToProject(repository);
            }}
          >
            Link to Project
          </a>
        </div>
      </div>
    </div>
  );
};

export default RepositoryCard;

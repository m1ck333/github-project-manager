import React from "react";
import { FiUser, FiUserX } from "react-icons/fi";

import { Button } from "@/common/components/ui";
import { RepositoryCollaborator } from "@/features/projects/types";

import styles from "./collaborator-card.module.scss";

interface CollaboratorCardProps {
  collaborator: RepositoryCollaborator;
  onRemove: (collaboratorId: string) => void;
}

const CollaboratorCard: React.FC<CollaboratorCardProps> = ({ collaborator, onRemove }) => {
  return (
    <div className={styles.collaboratorCard}>
      <div className={styles.collaboratorInfo}>
        <img
          src={collaborator.avatarUrl}
          alt={collaborator.login}
          className={styles.collaboratorAvatar}
        />
        <div className={styles.collaboratorDetails}>
          <div className={styles.collaboratorName}>
            <FiUser />
            <span>{collaborator.login}</span>
          </div>
          <div className={styles.collaboratorPermission}>{collaborator.permission}</div>
        </div>
      </div>
      <Button
        variant="danger"
        onClick={() => onRemove(collaborator.id)}
        className={styles.removeButton}
      >
        <FiUserX /> Remove
      </Button>
    </div>
  );
};

export default CollaboratorCard;

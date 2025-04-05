import React from "react";
import { FiUser, FiUserX } from "react-icons/fi";

import { Button } from "@/common/components/ui";
import { Stack } from "@/common/components/ui/display";
import { Typography } from "@/common/components/ui/typography";
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
          <Stack cross="center" className={styles.collaboratorName}>
            <FiUser />
            <Typography variant="body1" component="span">
              {collaborator.login}
            </Typography>
          </Stack>
          <Typography variant="caption" className={styles.collaboratorPermission}>
            {collaborator.permission}
          </Typography>
        </div>
      </div>
      <Button
        variant="danger"
        onClick={() => onRemove(collaborator.id)}
        className={styles.removeButton}
      >
        <FiUserX />{" "}
        <Typography variant="button" component="span">
          Remove
        </Typography>
      </Button>
    </div>
  );
};

export default CollaboratorCard;

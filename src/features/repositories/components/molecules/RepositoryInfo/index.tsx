import React from "react";

import { Repository } from "../../../types/repository";

import styles from "./repository-info.module.scss";

interface RepositoryInfoProps {
  repository: Repository;
}

const RepositoryInfo: React.FC<RepositoryInfoProps> = ({ repository }) => {
  return (
    <div className={styles.repoInfo}>
      <div className={styles.repoOwner}>
        <img
          src={repository.owner.avatar_url}
          alt={repository.owner.login}
          className={styles.ownerAvatar}
        />
        <span>{repository.owner.login}</span>
      </div>

      {repository.description && (
        <div className={styles.description}>
          <h3>Description</h3>
          <p>{repository.description}</p>
        </div>
      )}
    </div>
  );
};

export default RepositoryInfo;

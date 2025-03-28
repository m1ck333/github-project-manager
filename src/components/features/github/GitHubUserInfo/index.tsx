import { observer } from "mobx-react-lite";
import React from "react";
import { FiGithub, FiUser } from "react-icons/fi";

import Loading from "@/components/ui/Loading";
import Tooltip from "@/components/ui/Tooltip";
import { useGitHubUser } from "@/hooks/useGitHubUser";

import styles from "./GitHubUserInfo.module.scss";

/**
 * Component that displays the user's GitHub avatar and provides user info in a tooltip
 * when a valid token is present
 */
const GitHubUserInfo: React.FC = observer(() => {
  const { isLoading, isAuthenticated, hasToken, user } = useGitHubUser();

  // Content to show inside tooltip - no avatar since it's already visible
  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipUserInfo}>
        {isAuthenticated && user ? (
          <>
            <div className={styles.userName}>{user.login}</div>
            <button
              className={styles.profileButton}
              onClick={() => window.open(user.url, "_blank")}
            >
              <FiGithub className={styles.icon} />
              View GitHub Profile
            </button>
          </>
        ) : (
          <div className={styles.userName}>Not logged in</div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.userInfoContainer}>
        <div className={styles.loadingContainer}>
          <Loading size="small" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userInfoContainer}>
      <Tooltip content={tooltipContent} position="left" sticky={true} closeOnMouseLeave={false}>
        <div className={styles.avatarContainer}>
          {isAuthenticated && user ? (
            <img
              src={user.avatarUrl}
              alt={`${user.login}'s profile`}
              className={styles.userAvatar}
            />
          ) : (
            <div className={styles.placeholderAvatar}>
              <FiUser size={16} />
            </div>
          )}
        </div>
      </Tooltip>
    </div>
  );
});

export default GitHubUserInfo;

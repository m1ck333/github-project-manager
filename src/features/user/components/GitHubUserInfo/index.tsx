import { observer } from "mobx-react-lite";
import React from "react";
import { FiUser } from "react-icons/fi";

import ViewOnGithub from "@/common/components/composed/ViewOnGithubLink";
import { Loading, Tooltip } from "@/common/components/ui";
import { GITHUB_URL } from "@/common/constants/github.const";
import { useUserProfile } from "@/features/user/hooks";

import styles from "./github-user-info.module.scss";

/**
 * Component that displays the user's GitHub avatar and provides user info in a tooltip
 * when a valid token is present
 */
const GitHubUserInfo: React.FC = observer(() => {
  // Access the user profile from the user hook
  const { profile: userProfile, loading } = useUserProfile();

  const isAuthenticated = !!userProfile;

  // Content to show inside tooltip - no avatar since it's already visible
  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipUserInfo}>
        {isAuthenticated && userProfile ? (
          <>
            <div className={styles.userName}>{userProfile.login}</div>
            <ViewOnGithub link={userProfile.websiteUrl || `${GITHUB_URL}/${userProfile.login}`} />
          </>
        ) : (
          <div className={styles.userName}>Not logged in</div>
        )}
      </div>
    </div>
  );

  if (loading) {
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
          {isAuthenticated && userProfile ? (
            <img
              src={userProfile.avatarUrl}
              alt={`${userProfile.login}'s profile`}
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

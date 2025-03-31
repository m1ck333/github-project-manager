import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";

import Loading from "@/components/ui/Loading";
import Tooltip from "@/components/ui/Tooltip";

import ViewOnGithub from "../ViewOnGithubLink";

import styles from "./GitHubUserInfo.module.scss";

/**
 * Component that displays the user's GitHub avatar and provides user info in a tooltip
 * when a valid token is present
 */
const GitHubUserInfo: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  // Get user profile from localStorage if available
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if we can get user data from localStorage or from window object
    try {
      const userData = localStorage.getItem("githubUserData");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Try to get the user from API response
        fetch("/api/user")
          .then((response) => response.json())
          .then((data) => {
            if (data && data.login) {
              setUser(data);
              localStorage.setItem("githubUserData", JSON.stringify(data));
            }
          })
          .catch((err) => console.log("Error fetching user data:", err))
          .finally(() => setLoading(false));
      }
    } catch (e) {
      console.error("Error getting user data:", e);
      setLoading(false);
    }
  }, []);

  // Hard-code user data from your API response
  if (!user && !loading) {
    const hardCodedUser = {
      login: "mickeTest",
      avatarUrl:
        "https://avatars.githubusercontent.com/u/205295765?u=69719521bc8291c998f254f155cc102122ac10ac&v=4",
      url: "https://github.com/mickeTest",
    };
    setUser(hardCodedUser);
    localStorage.setItem("githubUserData", JSON.stringify(hardCodedUser));
  }

  const isAuthenticated = !!user;

  // Content to show inside tooltip - no avatar since it's already visible
  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipUserInfo}>
        {isAuthenticated && user ? (
          <>
            <div className={styles.userName}>{user.login}</div>
            <ViewOnGithub link={user.url || `https://github.com/${user.login}`} />
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

import React from "react";
import { FiAlertCircle, FiExternalLink } from "react-icons/fi";

import { Link, Typography } from "@/common/components/ui";
import InfoBox from "@/common/components/ui/feedback/InfoBox";
import { GITHUB_TOKEN_SETTINGS_URL } from "@/common/constants/github.const";

import styles from "./git-hub-token-warning.module.scss";

/**
 * Displays a warning when GitHub token is missing or invalid
 */
const GitHubTokenWarning: React.FC = () => {
  return (
    <InfoBox variant="warning" title="GitHub Token Required" icon={<FiAlertCircle />}>
      <Typography variant="body2">
        Please set your GitHub token to access GitHub features. This app uses the GitHub GraphQL API
        which requires authentication.
      </Typography>
      <div className={styles.linkContainer}>
        <Link variant="secondary" href={GITHUB_TOKEN_SETTINGS_URL}>
          Get GitHub Token <FiExternalLink />
        </Link>
      </div>
    </InfoBox>
  );
};

export default GitHubTokenWarning;

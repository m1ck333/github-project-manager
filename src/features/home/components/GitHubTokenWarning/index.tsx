import { observer } from "mobx-react-lite";
import React, { useState } from "react";

import { userStore } from "@/stores";

import InfoBox from "../../../../common/components/ui/feedback/InfoBox";
import Loading from "../../../../common/components/ui/feedback/Loading";

import styles from "./GitHubTokenWarning.module.scss";

const GitHubTokenWarning: React.FC = observer(() => {
  const [dismissed, setDismissed] = useState(false);
  const isLoading = userStore.loading;
  const hasToken = userStore.hasToken();
  const isAuthenticated = !!userStore.userProfile;
  const errorMessage = userStore.error;

  if (isLoading) {
    return <Loading size="small" text="Checking GitHub configuration..." />;
  }

  if ((hasToken && isAuthenticated) || dismissed) {
    return null;
  }

  return (
    <InfoBox
      variant="warning"
      title={!hasToken ? "GitHub Token Missing" : "GitHub Token Invalid"}
      dismissible
      onDismiss={() => setDismissed(true)}
    >
      {!hasToken ? (
        <>
          <p>
            To use all features of this application, please set your GitHub token by adding{" "}
            <code>VITE_GITHUB_TOKEN</code> to your environment variables.
          </p>
          <p>
            <a
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to create a GitHub token
            </a>
          </p>
        </>
      ) : (
        <>
          <p>
            Your GitHub token was found but appears to be invalid or doesn't have the required
            permissions.
          </p>
          {errorMessage && <p className={styles.errorDetails}>{errorMessage}</p>}
          <p>
            <a
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to create a new GitHub token with the correct permissions
            </a>
          </p>
        </>
      )}
    </InfoBox>
  );
});

export default GitHubTokenWarning;

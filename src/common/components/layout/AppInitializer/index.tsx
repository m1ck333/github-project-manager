import React from "react";

import { Stack } from "@/common/components/ui/display";
import Error from "@/common/components/ui/feedback/Error";
import Loading from "@/common/components/ui/feedback/Loading";
import { useAppInitialization } from "@/features/app/hooks";

import styles from "./app-initializer.module.scss";

interface AppInitializerProps {
  children: React.ReactNode;
}

/**
 * Component that initializes app data before rendering children
 * Handles loading states and error feedback
 */
export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { loading, error, initializeApp } = useAppInitialization();

  if (loading) {
    return (
      <Stack direction="column" align="center" cross="center" className={styles.container}>
        <Loading text="Initializing GitHub Project Manager..." />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack direction="column" align="center" cross="center" className={styles.errorContainer}>
        <Error
          title="Failed to load application data"
          error={error}
          onRetry={() => initializeApp(true)}
          message="Please check your GitHub token and internet connection."
        />
      </Stack>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;

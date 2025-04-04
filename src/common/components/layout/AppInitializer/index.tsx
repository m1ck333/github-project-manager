import React from "react";

import Error from "@/common/components/ui/feedback/Error";
import Loading from "@/common/components/ui/feedback/Loading";
import { useAppInitialization } from "@/features/app/hooks";

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
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Loading size="large" text="Initializing GitHub Project Manager..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <Error
          title="Failed to load application data"
          error={error}
          onRetry={() => initializeApp(true)}
          message="Please check your GitHub token and internet connection."
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;

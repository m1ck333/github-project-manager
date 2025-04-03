import { observer } from "mobx-react-lite";
import { FC, ReactNode } from "react";
import { FiRefreshCcw } from "react-icons/fi";

import { useAppInitialization } from "../../../hooks/useAppInitialization";
import { Button } from "../../ui";
import InfoBox from "../../ui/feedback/InfoBox";
import Loading from "../../ui/feedback/Loading";

import styles from "./AppInitializer.module.scss";

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * Component that handles app initialization
 * It loads all data at startup and shows a loading state or error
 */
export const AppInitializer: FC<AppInitializerProps> = observer(({ children }) => {
  const { loading, error, retry } = useAppInitialization();

  if (loading || error) {
    return (
      <div className={styles.errorContainer}>
        {loading ? (
          <Loading text="Initializing application..." size="large" fullPage={true} />
        ) : (
          <InfoBox variant="error">
            <h2>Error loading data</h2>
            <p>{error}</p>
            <Button onClick={retry}>
              Retry <FiRefreshCcw />
            </Button>
          </InfoBox>
        )}
      </div>
    );
  }

  return <>{children}</>;
});

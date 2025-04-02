import React, { ReactNode } from "react";
import { FiRefreshCw } from "react-icons/fi";

import Button from "../../../ui/Button";
import InfoBox from "../../../ui/InfoBox";
import Input from "../../../ui/Input";
import Loading from "../../../ui/Loading";

import styles from "./GridContainer.module.scss";

interface GridContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh?: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  loadingText?: string;
  emptyState?: ReactNode;
}

const GridContainer: React.FC<GridContainerProps> = ({
  children,
  className,
  title,
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
  error,
  onRetry,
  loadingText = "Loading...",
  emptyState,
}) => {
  const showToolbar = !loading && !error && (onSearchChange || onRefresh);

  const renderContent = () => {
    if (loading) {
      return <Loading text={loadingText} />;
    }

    if (error) {
      return (
        <InfoBox variant="error" title={`Error Loading ${title || "Data"}`} dismissible={false}>
          <p>{error}</p>
          {onRetry && (
            <Button variant="primary" size="small" onClick={onRetry}>
              Retry
            </Button>
          )}
        </InfoBox>
      );
    }

    // Show empty state only if children is empty array and emptyState is provided
    if (React.Children.count(children) === 0 && emptyState) {
      return emptyState;
    }

    return <div className={`${styles.gridContainer} ${className || ""}`}>{children}</div>;
  };

  return (
    <div className={styles.gridContainerWrapper}>
      {title && <h2 className={styles.gridTitle}>{title}</h2>}

      {showToolbar && (
        <div className={styles.toolbar}>
          {onSearchChange && (
            <div className={styles.search}>
              <Input
                placeholder={`Search ${title?.toLowerCase() || ""}...`}
                value={searchQuery}
                onChange={onSearchChange}
              />
            </div>
          )}
          {onRefresh && (
            <div className={styles.toolbarActions}>
              <Button variant="secondary" onClick={onRefresh} title={`Refresh ${title || "data"}`}>
                <FiRefreshCw />
              </Button>
            </div>
          )}
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default GridContainer;

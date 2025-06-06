import React, { ReactNode } from "react";
import { FiRefreshCw } from "react-icons/fi";

import Typography from "@/common/components/ui/display/Typography";

import Button from "../../../ui/display/Button";
import InfoBox from "../../../ui/feedback/InfoBox";
import Loading from "../../../ui/feedback/Loading";
import Input from "../../../ui/form/Input";

import styles from "./grid-container.module.scss";

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
          <Typography variant="body1" color="error">
            {error}
          </Typography>
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

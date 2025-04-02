import React, { ReactNode } from "react";
import { FiRefreshCw } from "react-icons/fi";

import Button from "../../ui/Button";
import InfoBox from "../../ui/InfoBox";
import Input from "../../ui/Input";
import Loading from "../../ui/Loading";
import Container from "../Container";

import styles from "./PageContainer.module.scss";

interface PageContainerProps {
  title: string;
  children: ReactNode;
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh?: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  loadingText?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  children,
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
  error,
  onRetry,
  loadingText = "Loading...",
}) => {
  return (
    <Container size="large" withPadding title={title}>
      <div className={styles.pageContent}>
        {!loading && !error && (
          <div className={styles.toolbar}>
            {onSearchChange && (
              <div className={styles.search}>
                <Input
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={onSearchChange}
                />
              </div>
            )}
            {onRefresh && (
              <div className={styles.toolbarActions}>
                <Button variant="secondary" onClick={onRefresh} title={`Refresh ${title}`}>
                  <FiRefreshCw />
                </Button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <Loading text={loadingText} />
        ) : error ? (
          <InfoBox variant="error" title={`Error Loading ${title}`} dismissible={false}>
            <p>{error}</p>
            {onRetry && (
              <Button variant="primary" size="small" onClick={onRetry}>
                Retry
              </Button>
            )}
          </InfoBox>
        ) : (
          children
        )}
      </div>
    </Container>
  );
};

export default PageContainer;

import React, { ReactNode, useEffect } from "react";
import { useParams } from "react-router-dom";

import { env } from "../../../../config/env";
import BackButton, { BackDestination } from "../../composed/BackButton";
import Error from "../../ui/feedback/Error";
import Container from "../Container";

import styles from "./PageContainer.module.scss";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  fluid?: boolean;
  withBg?: boolean;
  backDestination?: BackDestination;
  titleActions?: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  className?: string;
  onRetry?: () => void;
}

/**
 * PageContainer provides a consistent layout for all pages
 * with built-in support for titles, back buttons, and error states
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  fluid = false,
  withBg = false,
  backDestination,
  titleActions,
  isLoading = false,
  error = null,
  loadingMessage = "Loading...",
  className = "",
  onRetry,
}) => {
  const params = useParams();
  const projectId = params.projectId || undefined;

  // Set document title based on props
  useEffect(() => {
    document.title = title ? `${title} | ${env.appName}` : env.appName;
  }, [title]);

  // Helper to render loading state
  const renderLoading = () => (
    <div className={styles.loading}>
      <p>{loadingMessage}</p>
    </div>
  );

  return (
    <Container
      fluid={fluid}
      withPadding
      withBg={withBg}
      title={title}
      className={`${styles.pageContainer} ${className}`}
    >
      {backDestination && (
        <div className={styles.backButtonContainer}>
          <BackButton destination={backDestination} itemId={projectId} />
        </div>
      )}

      {titleActions && <div className={styles.titleActions}>{titleActions}</div>}

      {/* Main content based on state */}
      {isLoading ? (
        renderLoading()
      ) : error ? (
        <Error error={error} title={`Error - ${title || "Page"}`} onRetry={onRetry} />
      ) : (
        <div className={styles.pageContent}>{children}</div>
      )}
    </Container>
  );
};

export default PageContainer;

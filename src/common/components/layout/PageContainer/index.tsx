import React, { ReactNode, useEffect } from "react";
import { useParams } from "react-router-dom";

import { env } from "../../../config/env";
import BackButton, { BackDestination } from "../../composed/BackButton";
import Error from "../../ui/feedback/Error";
import Container from "../Container";

import styles from "./PageContainer.module.scss";

interface PageContainerProps {
  children: ReactNode;
  title?: ReactNode;
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
    // For document title, extract string from React node if necessary
    let titleText = "";
    if (typeof title === "string") {
      titleText = title;
    } else if (title) {
      // Try to get innerText (this won't work in SSR, but we're client-only)
      const tempDiv = document.createElement("div");
      // @ts-expect-error - This is a hack to get text content from ReactNode
      tempDiv.innerHTML = title.props?.children || "";
      titleText = tempDiv.textContent || "";
    }

    document.title = titleText ? `${titleText} | ${env.appName}` : env.appName;
  }, [title]);

  // Helper to render loading state
  const renderLoading = () => (
    <div className={styles.loading}>
      <p>{loadingMessage}</p>
    </div>
  );

  // Get a title string for error display
  const getErrorTitle = () => {
    if (typeof title === "string") {
      return `Error - ${title}`;
    }
    return "Error - Page";
  };

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
        <Error error={error} title={getErrorTitle()} onRetry={onRetry} />
      ) : (
        <div className={styles.pageContent}>{children}</div>
      )}
    </Container>
  );
};

export default PageContainer;

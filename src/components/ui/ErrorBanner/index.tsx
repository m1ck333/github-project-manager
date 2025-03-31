import React from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import Button from "../Button";
import InfoBox from "../InfoBox";

import styles from "./ErrorBanner.module.scss";

/**
 * @deprecated Consider using InfoBox with variant="error" for new code.
 * This component is maintained for existing usage.
 */
interface ErrorBannerProps {
  error: Error | string;
  onRetry?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onRetry }) => {
  // Convert error to string if it's an Error object
  const errorMessage = error instanceof Error ? error.message : error;

  // Check if the error is related to API rate limits
  const isRateLimitError =
    (error instanceof Error && error.name === "RateLimitError") ||
    (errorMessage && errorMessage.includes("API rate limit"));

  const title = isRateLimitError ? "GitHub API Rate Limit Exceeded" : "Error Loading Data";
  const message = isRateLimitError ? (
    <>
      <p>
        You've reached GitHub's API request limit. This happens when you make too many requests in a
        short period of time.
      </p>
      <p>Please wait a few minutes and try again. GitHub resets rate limits hourly.</p>
    </>
  ) : (
    <p>{errorMessage}</p>
  );

  return (
    <InfoBox
      variant="error"
      title={title}
      icon={<FiAlertCircle size={24} />}
      className={styles.errorBanner}
    >
      {message}
      {onRetry && (
        <Button onClick={onRetry} variant="primary" className={styles.retryButton}>
          <FiRefreshCw size={16} /> Retry
        </Button>
      )}
    </InfoBox>
  );
};

// Full page error component for critical application errors
interface FullPageErrorProps {
  error: Error | string;
  onRetry?: () => void;
  actions?: React.ReactNode;
}

export const FullPageError: React.FC<FullPageErrorProps> = ({ error, onRetry, actions }) => {
  // Convert error to string if it's an Error object
  const errorMessage = error instanceof Error ? error.message : error;

  // Check if the error is related to API rate limits
  const isRateLimitError =
    (error instanceof Error && error.name === "RateLimitError") ||
    (errorMessage && errorMessage.includes("API rate limit"));

  const title = isRateLimitError ? "GitHub API Rate Limit Exceeded" : "Application Error";
  const message = isRateLimitError ? (
    <>
      <p>
        You've reached GitHub's API request limit. This happens when you make too many requests in a
        short period of time.
      </p>
      <p>Please wait a few minutes and try again. GitHub resets rate limits hourly.</p>
    </>
  ) : (
    <p>{errorMessage}</p>
  );

  return (
    <div className={styles.fullPageError}>
      <InfoBox
        variant="error"
        title={title}
        icon={<FiAlertCircle size={48} />}
        className={styles.fullPageInfoBox}
      >
        {message}
        <div className={styles.actionButtons}>
          {onRetry && (
            <Button onClick={onRetry} variant="primary" className={styles.retryButton}>
              <FiRefreshCw size={16} /> Retry
            </Button>
          )}
          {actions}
        </div>
      </InfoBox>
    </div>
  );
};

export default ErrorBanner;

import React from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import Button from "../Button";

import styles from "./ErrorBanner.module.scss";

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

  return (
    <div className={styles.errorBanner}>
      <div className={styles.errorIcon}>
        <FiAlertCircle size={24} />
      </div>
      <div className={styles.errorContent}>
        <h3>{isRateLimitError ? "GitHub API Rate Limit Exceeded" : "Error Loading Data"}</h3>
        {isRateLimitError ? (
          <>
            <p>
              You've reached GitHub's API request limit. This happens when you make too many
              requests in a short period of time.
            </p>
            <p>Please wait a few minutes and try again. GitHub resets rate limits hourly.</p>
          </>
        ) : (
          <p>{errorMessage}</p>
        )}
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="primary" className={styles.retryButton}>
          <FiRefreshCw size={16} /> Retry
        </Button>
      )}
    </div>
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

  return (
    <div className={styles.fullPageError}>
      <div className={styles.errorIcon}>
        <FiAlertCircle size={48} />
      </div>
      <div className={styles.errorContent}>
        <h2>{isRateLimitError ? "GitHub API Rate Limit Exceeded" : "Application Error"}</h2>
        {isRateLimitError ? (
          <>
            <p>
              You've reached GitHub's API request limit. This happens when you make too many
              requests in a short period of time.
            </p>
            <p>Please wait a few minutes and try again. GitHub resets rate limits hourly.</p>
          </>
        ) : (
          <p>{errorMessage}</p>
        )}
      </div>
      <div className={styles.actionButtons}>
        {onRetry && (
          <Button onClick={onRetry} variant="primary" className={styles.retryButton}>
            <FiRefreshCw size={16} /> Retry
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
};

export default ErrorBanner;

import React from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import { Stack } from "@/common/components/ui/display";
import { getErrorMessage } from "@/common/utils/errors.utils";

import Button from "../../display/Button";

import styles from "./Error.module.scss";

export interface ErrorProps {
  error?: unknown | null;
  message?: string;
  title?: string;
  onRetry?: () => void;
  fullPage?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Error component for displaying error messages with optional retry functionality
 */
const Error: React.FC<ErrorProps> = ({
  error,
  message,
  title = "Error",
  onRetry,
  fullPage = false,
  actions,
  className = "",
}) => {
  // Get the error message - either from error prop, message prop, or default
  const errorText = error
    ? getErrorMessage(error)
    : message || "Something went wrong. Please try again.";

  // Check if the error is related to API rate limits
  const isRateLimitError = errorText.includes("API rate limit");

  // Set title based on error type
  const displayTitle = isRateLimitError ? "GitHub API Rate Limit Exceeded" : title;

  // Set message content based on error type
  const messageContent = isRateLimitError ? (
    <>
      <p className={styles.message}>
        You've reached GitHub's API request limit. This happens when you make too many requests in a
        short period of time.
      </p>
      <p className={styles.message}>
        Please wait a few minutes and try again. GitHub resets rate limits hourly.
      </p>
    </>
  ) : (
    <p className={styles.message}>{errorText}</p>
  );

  // For full page errors, use a larger layout
  if (fullPage) {
    return (
      <Stack
        direction="column"
        align="center"
        cross="center"
        className={`${styles.fullPageError} ${className}`}
      >
        <FiAlertCircle size={48} className={styles.icon} />
        <h3 className={styles.title}>{displayTitle}</h3>
        {messageContent}
        {(onRetry || actions) && (
          <Stack spacing={2} className={styles.actions}>
            {onRetry && (
              <Button onClick={onRetry} variant="primary" className={styles.retryButton}>
                <Stack spacing={0.5} cross="center">
                  <FiRefreshCw size={16} /> Retry
                </Stack>
              </Button>
            )}
            {actions}
          </Stack>
        )}
      </Stack>
    );
  }

  // For inline errors, use a more compact layout
  return (
    <Stack className={`${styles.error} ${className}`}>
      <div className={styles.errorContent}>
        <Stack cross="center" className={styles.errorHeader}>
          <FiAlertCircle size={20} className={styles.icon} />
          <h3 className={styles.title}>{displayTitle}</h3>
        </Stack>
        {messageContent}
        {(onRetry || actions) && (
          <Stack spacing={1} className={styles.actions}>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="primary"
                size="small"
                className={styles.retryButton}
              >
                <Stack spacing={0.5} cross="center">
                  <FiRefreshCw size={14} /> Retry
                </Stack>
              </Button>
            )}
            {actions}
          </Stack>
        )}
      </div>
    </Stack>
  );
};

export default Error;

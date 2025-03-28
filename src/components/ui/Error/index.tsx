import React from "react";

import Button from "../Button";

import styles from "./Error.module.scss";

interface ErrorProps {
  message?: string;
  retry?: () => void;
}

const Error: React.FC<ErrorProps> = ({
  message = "Something went wrong. Please try again.",
  retry,
}) => {
  return (
    <div className={styles.error}>
      <div className={styles.icon}>!</div>
      <p className={styles.message}>{message}</p>
      {retry && (
        <Button variant="primary" onClick={retry} className={styles.retryButton}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;

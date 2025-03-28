import React from "react";

import styles from "./Loading.module.scss";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  fullPage?: boolean;
  text?: string;
  className?: string;
  fixedHeight?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = "medium",
  fullPage = false,
  text = "",
  className = "",
  fixedHeight = false,
}) => {
  const minHeightClass = fixedHeight ? styles.fixedHeight : "";

  return (
    <div
      className={`${styles.loading} ${styles[size]} ${fullPage ? styles.fullPage : ""} ${minHeightClass} ${className}`}
    >
      <div className={styles.spinner}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loading;

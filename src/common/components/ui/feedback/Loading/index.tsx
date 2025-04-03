import React from "react";

import styles from "./Loading.module.scss";

interface LoadingProps {
  text?: string;
  size?: "small" | "medium" | "large";
  inline?: boolean;
  className?: string;
  fixedHeight?: boolean;
  fullPage?: boolean;
}

/**
 * Loading component to display loading state with optional text
 */
const Loading: React.FC<LoadingProps> = ({
  text,
  size = "medium",
  inline = false,
  className = "",
  fixedHeight = false,
  fullPage = false,
}) => {
  const sizeClass = size ? styles[size] : "";
  const containerClass = inline ? styles.inlineContainer : styles.container;
  const fixedHeightClass = fixedHeight ? styles.fixedHeight : "";
  const fullPageClass = fullPage ? styles.fullPage : "";

  return (
    <div
      className={`${styles.loading} ${sizeClass} ${containerClass} ${fixedHeightClass} ${fullPageClass} ${className}`}
    >
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loading;

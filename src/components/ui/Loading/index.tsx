import React from "react";
import styles from "./Loading.module.scss";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  fullPage?: boolean;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "medium",
  fullPage = false,
  text = "Loading...",
}) => {
  return (
    <div className={`${styles.loading} ${styles[size]} ${fullPage ? styles.fullPage : ""}`}>
      <div className={styles.spinner}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loading;

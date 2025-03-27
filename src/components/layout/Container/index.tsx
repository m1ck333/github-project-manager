import React, { ReactNode } from "react";
import styles from "./Container.module.scss";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "small" | "medium" | "large"; // Different size options
  withPadding?: boolean;
  withBg?: boolean;
  title?: string;
  titleClassName?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  size = "medium",
  withPadding = true,
  withBg = false,
  title,
  titleClassName = "",
}) => {
  return (
    <div
      className={`
        ${styles.container} 
        ${styles[size]} 
        ${withPadding ? styles.withPadding : ""} 
        ${withBg ? styles.withBg : ""} 
        ${className}
      `}
    >
      {title && <h1 className={`${styles.title} ${titleClassName}`}>{title}</h1>}
      {children}
    </div>
  );
};

export default Container;

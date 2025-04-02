import React, { ReactNode } from "react";

import styles from "./Container.module.scss";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  fluid?: boolean;
  withPadding?: boolean;
  withBg?: boolean;
  title?: string;
  titleClassName?: string;
}

/**
 * A simple container component similar to Bootstrap's container
 * Provides basic layout containment with optional fluid behavior
 */
const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  fluid = false,
  withPadding = true,
  withBg = false,
  title,
  titleClassName = "",
}) => {
  return (
    <div
      className={`
        ${styles.container} 
        ${fluid ? styles.containerFluid : ""} 
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

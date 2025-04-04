import React, { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import styles from "./Link.module.scss";

interface LinkProps {
  children: ReactNode;
  href?: string;
  to?: string;
  className?: string;
  external?: boolean;
  variant?: "primary" | "secondary" | "tertiary";
  onClick?: () => void;
  underlineOnHover?: boolean;
}

const Link: React.FC<LinkProps> = ({
  children,
  href,
  to,
  className = "",
  external = false,
  variant = "primary",
  onClick,
  underlineOnHover = true,
}) => {
  const combinedClassName = `${styles.link} ${styles[variant]} ${
    underlineOnHover ? styles.underlineOnHover : ""
  } ${className}`;

  // External link
  if (href) {
    return (
      <a
        href={href}
        className={combinedClassName}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  // Internal router link
  if (to) {
    return (
      <RouterLink to={to} className={combinedClassName} onClick={onClick}>
        {children}
      </RouterLink>
    );
  }

  // Button-like link (just onClick)
  return (
    <button className={`${combinedClassName} ${styles.buttonLink}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Link;

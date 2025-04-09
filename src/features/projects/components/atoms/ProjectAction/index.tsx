import React, { ReactNode } from "react";

import styles from "./project-action.module.scss";

interface ProjectActionProps {
  icon: ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: "default" | "primary" | "danger";
  size?: "small" | "medium";
  disabled?: boolean;
  title?: string;
  className?: string;
}

/**
 * Atomic component for project action buttons with consistent styling
 */
const ProjectAction: React.FC<ProjectActionProps> = ({
  icon,
  label,
  onClick,
  variant = "default",
  size = "medium",
  disabled = false,
  title,
  className,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.action} ${styles[variant]} ${styles[size]} ${className || ""}`}
      disabled={disabled}
      title={title || label}
      aria-label={label}
    >
      {icon}
    </button>
  );
};

export default ProjectAction;

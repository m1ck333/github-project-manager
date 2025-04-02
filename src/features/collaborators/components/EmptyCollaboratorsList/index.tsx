import React from "react";
import { FiUsers, FiUserPlus } from "react-icons/fi";

import styles from "./EmptyCollaboratorsList.module.scss";

interface EmptyCollaboratorsListProps {
  /**
   * The type of entity that has no collaborators
   */
  entityType?: "project" | "repository";
  /**
   * Icon to display. If none provided, an icon will be chosen based on entityType
   */
  icon?: "users" | "user-plus";
  /**
   * Custom message to display. If none provided, a default message will be used
   */
  message?: string;
  /**
   * Additional CSS class for styling
   */
  className?: string;
}

/**
 * A reusable component to display when there are no collaborators
 */
const EmptyCollaboratorsList: React.FC<EmptyCollaboratorsListProps> = ({
  entityType = "project",
  icon,
  message,
  className = "",
}) => {
  // Default icon based on entity type if not explicitly provided
  const iconToShow = icon || (entityType === "repository" ? "user-plus" : "users");

  // Default message based on entity type if not explicitly provided
  const defaultMessage = `No collaborators yet. Add collaborators to work together on this ${entityType}.`;
  const messageToShow = message || defaultMessage;

  return (
    <div className={`${styles.emptyCollaborators} ${className}`}>
      {iconToShow === "users" ? <FiUsers size={48} /> : <FiUserPlus size={32} />}
      <p>{messageToShow}</p>
    </div>
  );
};

export default EmptyCollaboratorsList;

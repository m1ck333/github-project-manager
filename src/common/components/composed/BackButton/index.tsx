import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/common/routes";

import Button from "../../ui/display/Button";

import styles from "./back-button.module.scss";

// Common destinations for back navigation
export type BackDestination = "projects" | "repositories" | "project";

interface BackButtonProps {
  destination: BackDestination;
  itemId?: string;
  variant?: "text" | "button";
  className?: string;
}

/**
 * A consistent back button component that navigates to common destinations
 * with automatically generated text
 */
const BackButton: React.FC<BackButtonProps> = ({
  destination,
  itemId,
  variant = "text",
  className = "",
}) => {
  const navigate = useNavigate();

  // Generate text based on destination
  const getButtonText = (): string => {
    switch (destination) {
      case "projects":
        return "Back to Projects";
      case "repositories":
        return "Back to Repositories";
      case "project":
        return "Back to Project";
      default:
        return "Back";
    }
  };

  const handleClick = () => {
    // Map the destination enum to actual routes
    switch (destination) {
      case "projects":
        navigate(ROUTES.PROJECTS);
        break;
      case "repositories":
        navigate(ROUTES.REPOSITORIES);
        break;
      case "project":
        if (itemId) {
          navigate(ROUTES.PROJECT_DETAIL(itemId));
        } else {
          console.warn("BackButton: itemId is required for project destination");
          navigate(-1);
        }
        break;
      default:
        navigate(-1);
    }
  };

  const text = getButtonText();

  if (variant === "button") {
    return (
      <Button
        variant="secondary"
        onClick={handleClick}
        className={`${styles.buttonVariant} ${className}`}
      >
        <FiArrowLeft /> {text}
      </Button>
    );
  }

  return (
    <button onClick={handleClick} className={`${styles.backButton} ${className}`}>
      <FiArrowLeft /> {text}
    </button>
  );
};

export default BackButton;

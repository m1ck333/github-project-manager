import { useState } from "react";

/**
 * A custom hook for managing project confirmation dialogs
 */
export function useProjectConfirmation() {
  const [isConfirming, setIsConfirming] = useState(false);

  /**
   * Confirm deletion of a project
   * @param projectName The name of the project to delete
   * @returns A promise that resolves to true if the user confirms, false otherwise
   */
  const confirmDeleteProject = async (projectName: string): Promise<boolean> => {
    setIsConfirming(true);

    try {
      const confirmed = window.confirm(
        `Are you sure you want to delete project "${projectName}"? This action cannot be undone.`
      );

      return confirmed;
    } finally {
      setIsConfirming(false);
    }
  };

  return {
    isConfirming,
    confirmDeleteProject,
  };
}

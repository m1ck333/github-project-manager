import { useState, useCallback } from "react";

interface ConfirmationState {
  isOpen: boolean;
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A custom hook for managing project confirmation dialogs
 */
export function useProjectConfirmation() {
  const [confirmState, setConfirmState] = useState<ConfirmationState>({
    isOpen: false,
    projectName: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const closeConfirmation = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Confirm deletion of a project using a modern Promise-based approach
   * @param projectName The name of the project to delete
   * @returns A promise that resolves to true if the user confirms, false otherwise
   */
  const confirmDeleteProject = useCallback(
    (projectName: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          projectName,
          onConfirm: () => {
            closeConfirmation();
            resolve(true);
          },
          onCancel: () => {
            closeConfirmation();
            resolve(false);
          },
        });
      });
    },
    [closeConfirmation]
  );

  return {
    confirmState,
    confirmDeleteProject,
  };
}

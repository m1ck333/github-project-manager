import { useState, useEffect } from "react";

import { useToast } from "@/common/components/ui";
import { useAsync } from "@/common/hooks";
import { withToast } from "@/common/utils";
import { projectStore } from "@/features/projects/stores";

export interface Repository {
  id: string;
  name: string;
  description?: string;
  owner?: {
    login: string;
  };
  html_url?: string;
}

export interface UseProjectRepositoriesProps {
  projectId: string;
}

export interface RepositoryFormData {
  owner: string;
  repoName: string;
}

export function useProjectRepositories({ projectId }: UseProjectRepositoriesProps) {
  // State for the add repository modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");

  // Async operations
  const {
    execute: linkExecute,
    isLoading: linkLoading,
    error: linkError,
    resetError: resetLinkError,
  } = useAsync();
  const {
    execute: unlinkExecute,
    isLoading: unlinkLoading,
    error: unlinkError,
    resetError: resetUnlinkError,
  } = useAsync();
  const { showToast } = useToast();

  // Ensure we have the selected project
  useEffect(() => {
    if (
      projectId &&
      (!projectStore.selectedProject || projectStore.selectedProject.id !== projectId)
    ) {
      projectStore.selectProject(projectId);
    }
  }, [projectId]);

  // Get repositories from the project store
  const repositories = projectStore.selectedProject?.repositories || [];

  // Link a repository to the project with current state values
  const handleLinkRepository = async () => {
    return withToast(
      linkExecute,
      showToast,
      async () => {
        // In the future, this would call a service to link the repository
        console.log(`Link repository ${owner}/${repoName} to project ${projectId}`);

        // Clear the form
        setShowAddModal(false);
        setOwner("");
        setRepoName("");
        return true;
      },
      `Repository ${owner}/${repoName} linked successfully`
    );
  };

  // Handle form submission from modal component
  const handleSubmitLinkForm = async (data: RepositoryFormData) => {
    // Update the state in the hook
    setOwner(data.owner);
    setRepoName(data.repoName);

    // Call the link repository function
    return handleLinkRepository();
  };

  // Unlink a repository from the project
  const handleUnlinkRepository = async (repoId: string) => {
    const repoToUnlink = repositories.find((repo) => repo.id === repoId);
    const repoName = repoToUnlink
      ? `${repoToUnlink.owner?.login || ""}/${repoToUnlink.name}`
      : repoId;

    return withToast(
      unlinkExecute,
      showToast,
      async () => {
        // In the future, this would call a service to unlink the repository
        console.log(`Unlink repository ${repoId} from project ${projectId}`);
        return true;
      },
      `Repository ${repoName} unlinked successfully`
    );
  };

  return {
    // Repository data
    repositories,

    // Modal state
    showAddModal,
    setShowAddModal,
    owner,
    setOwner,
    repoName,
    setRepoName,

    // Actions
    handleLinkRepository,
    handleUnlinkRepository,
    handleSubmitLinkForm,

    // Loading & error states
    isLoading: linkLoading || unlinkLoading || projectStore.isLoading,
    error: linkError || unlinkError || projectStore.error,
    resetError: () => {
      resetLinkError();
      resetUnlinkError();
      // Note: No direct way to reset projectStore error
    },
  };
}

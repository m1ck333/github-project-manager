import { useState, useEffect } from "react";

import { useAsync } from "@/common/hooks";
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
  const linkRepoAsync = useAsync();
  const unlinkRepoAsync = useAsync();

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
    const success = await linkRepoAsync.execute(async () => {
      // In the future, this would call a service to link the repository
      console.log(`Link repository ${owner}/${repoName} to project ${projectId}`);

      // Clear the form
      setShowAddModal(false);
      setOwner("");
      setRepoName("");
      return true;
    });

    return success;
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
    const success = await unlinkRepoAsync.execute(async () => {
      // In the future, this would call a service to unlink the repository
      console.log(`Unlink repository ${repoId} from project ${projectId}`);
      return true;
    });

    return success;
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
    isLoading: linkRepoAsync.isLoading || unlinkRepoAsync.isLoading || projectStore.isLoading,
    error: linkRepoAsync.error || unlinkRepoAsync.error || projectStore.error,
    resetError: () => {
      linkRepoAsync.resetError();
      unlinkRepoAsync.resetError();
      // Note: No direct way to reset projectStore error
    },
  };
}

import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiLink } from "react-icons/fi";
import { useParams } from "react-router-dom";

import ViewOnGithub from "@/common/components/composed/ViewOnGithubLink";
import PageContainer from "@/common/components/layout/PageContainer";
import { Button, Typography, useToast } from "@/common/components/ui";
import { Repositories } from "@/features/repositories";
import {
  CollaboratorsList,
  ProjectLinkModal,
  RepositoryInfo,
} from "@/features/repositories/components";
import { projectStore } from "@/stores";

import styles from "./RepositoryPage.module.scss";

const RepositoryPage: React.FC = observer(() => {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkProjectModal, setShowLinkProjectModal] = useState(false);

  useEffect(() => {
    if (owner && name) {
      // Get the repository using the CombinedRepositoryStore method
      const repository = Repositories.store.selectRepositoryWithoutFetch(owner, name);

      if (!repository) {
        // Only if repository isn't already in the store, fetch it
        setIsLoading(true);
        Repositories.store
          .fetchRepository(owner, name)
          .catch((err: Error) => {
            console.error("Error loading repository data:", err);
            setError(err instanceof Error ? err.message : String(err));
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [owner, name]);

  const handleAddCollaborator = async (username: string, permission: string): Promise<void> => {
    if (!owner || !name || !username) return;

    try {
      // Use the addRepositoryCollaborator method from the CombinedRepositoryStore
      await Repositories.store.addRepositoryCollaborator(
        `${owner}/${name}`, // Use repo name as ID since we don't have the actual ID
        { username, permission }
      );
      showToast("Collaborator added successfully", "success");
    } catch (error) {
      console.error("Error adding collaborator:", error);
      showToast(
        `Failed to add collaborator: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
      throw error;
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string): Promise<void> => {
    if (!owner || !name) return;

    try {
      // Use the removeRepositoryCollaborator method from the CombinedRepositoryStore
      await Repositories.store.removeRepositoryCollaborator(owner, name, collaboratorId);
      showToast("Collaborator removed successfully", "success");
    } catch (error) {
      console.error("Error removing collaborator:", error);
      showToast("Failed to remove collaborator", "error");
      throw error;
    }
  };

  const handleLinkToProject = async (projectId: string): Promise<void> => {
    if (!owner || !name) {
      showToast("Missing repository information", "error");
      return;
    }

    if (!projectId) {
      showToast("Please select a project first", "warning");
      return;
    }

    try {
      // Find the project to get its name for better UX
      const project = projectStore.projects.find((p) => p.id === projectId);

      const success = await projectStore.linkRepositoryToProject(projectId, owner, name);

      if (success) {
        showToast(`Successfully linked to ${project?.name || "project"}`, "success");
      } else {
        showToast("Failed to link repository to project", "error");
        throw new Error("Failed to link repository to project");
      }
    } catch (error) {
      console.error("Error linking repository to project:", error);
      showToast(
        `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        "error"
      );
      throw error;
    }
  };

  // Find the repository in the repositories array
  const repository = Repositories.store.repositories.find(
    (r) => r.owner.login === owner && r.name === name
  );

  // Define titleActions for PageContainer
  const titleActions = repository && (
    <div className={styles.headerActions}>
      <Button
        variant="secondary"
        onClick={() => setShowLinkProjectModal(true)}
        className={styles.linkButton}
      >
        <FiLink /> Link to Project
      </Button>
      <ViewOnGithub link={repository.html_url || ""} />
    </div>
  );

  if (isLoading && !repository) {
    return (
      <PageContainer
        title={<Typography variant="h1">Loading Repository...</Typography>}
        fluid={false}
        isLoading={true}
        loadingMessage="Loading repository details..."
        backDestination="repositories"
      >
        <div />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        title={<Typography variant="h1">Error</Typography>}
        fluid={false}
        error={error}
        backDestination="repositories"
      >
        <div />
      </PageContainer>
    );
  }

  if (!repository) {
    return (
      <PageContainer
        title={<Typography variant="h1">Repository Not Found</Typography>}
        fluid={false}
        error="The repository you're looking for doesn't exist or you don't have access to it."
        backDestination="repositories"
      >
        <div />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      fluid={false}
      title={<Typography variant="h1">{repository.name}</Typography>}
      backDestination="repositories"
      titleActions={titleActions}
      className={styles.pageContent}
    >
      <RepositoryInfo repository={repository} />

      <CollaboratorsList
        collaborators={repository.collaborators || []}
        isLoading={isLoading}
        onAddCollaborator={handleAddCollaborator}
        onRemoveCollaborator={handleRemoveCollaborator}
      />

      <ProjectLinkModal
        isOpen={showLinkProjectModal}
        onClose={() => setShowLinkProjectModal(false)}
        projects={projectStore.projects}
        isLoading={projectStore.loading}
        onLinkToProject={handleLinkToProject}
      />
    </PageContainer>
  );
});

export default RepositoryPage;

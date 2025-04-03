import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

import ViewOnGithub from "@/common/components/composed/ViewOnGithubLink";
import PageContainer from "@/common/components/layout/PageContainer";
import { Button } from "@/common/components/ui";
import { ROUTES } from "@/common/constants/routes";
import { ProjectBoard, ProjectRepositories } from "@/features/projects/components";
import { projectStore } from "@/stores";

const ProjectPage: React.FC = observer(() => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Find the project directly from the store
  useEffect(() => {
    if (!projectId) return;

    try {
      // We already have all projects loaded, just select the current one
      if (!projectStore.selectedProject || projectStore.selectedProject.id !== projectId) {
        projectStore.selectProjectWithoutFetch(projectId);
      }
    } catch (err) {
      console.error("Error selecting project:", err);
      setError(err instanceof Error ? err.message : String(err));
    }

    // Clear selected project on unmount only
    return () => {
      projectStore.clearSelectedProject();
    };
  }, [projectId]); // Only depends on projectId

  // Also observe errors from the projectStore
  useEffect(() => {
    if (projectStore.error) {
      setError(
        projectStore.error instanceof Error
          ? projectStore.error.message
          : String(projectStore.error)
      );
    } else {
      setError(null);
    }
  }, []);

  const project = projectStore.selectedProject;

  // Define title actions that will appear in the top-right corner
  const titleActions = project && (
    <>
      <ViewOnGithub link={project.url || ""} />
      <Button
        variant="secondary"
        onClick={() => navigate(ROUTES.PROJECT_COLLABORATORS(project.id))}
      >
        <FiUsers /> Manage Collaborators
      </Button>
    </>
  );

  return (
    <PageContainer
      title={project?.name || "Project"}
      backDestination="projects"
      isLoading={false}
      error={error}
      loadingMessage="Loading project..."
      titleActions={titleActions}
      fluid={false}
    >
      {project && (
        <>
          <ProjectBoard project={project} />
          <ProjectRepositories projectId={project.id} />
        </>
      )}
    </PageContainer>
  );
});

export default ProjectPage;

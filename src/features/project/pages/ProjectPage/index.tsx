import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

import ViewOnGithub from "@/common/components/composed/ViewOnGithubLink";
import PageContainer from "@/common/components/layout/PageContainer";
import Button from "@/common/components/ui/Button";
import { ROUTES } from "@/common/constants/routes";
import { ProjectBoard } from "@/features/project/components/ProjectBoard";
import ProjectRepositories from "@/features/project/components/ProjectRepositories";
import { projectStore } from "@/stores";

const ProjectPage: React.FC = observer(() => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    try {
      setIsLoading(true);

      // Projects are already loaded during app initialization
      // Just select the current project without triggering a data refresh
      projectStore.selectProjectWithoutFetch(projectId);
      setIsLoading(false);
    } catch (err) {
      setError((err as Error).message || "Failed to load project");
      setIsLoading(false);
    }

    // Clear selected project on unmount
    return () => {
      projectStore.clearSelectedProject();
    };
  }, [projectId]);

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
      isLoading={isLoading}
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

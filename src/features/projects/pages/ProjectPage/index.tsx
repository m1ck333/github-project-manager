import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { FiUsers } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

import ViewOnGithub from "@/common/components/composed/ViewOnGithubLink";
import PageContainer from "@/common/components/layout/PageContainer";
import { Button, Typography } from "@/common/components/ui";
import { ROUTES } from "@/common/constants/routes.const";
import { useAsync } from "@/common/hooks";
import { ProjectBoard, ProjectRepositories } from "@/features/projects/components";
import { projectStore } from "@/features/projects/stores";

const ProjectPage: React.FC = observer(() => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const hasLoaded = useRef(false);

  // Use the useAsync hook for better state management
  const { isLoading, error, execute } = useAsync();

  // Load project only once on component mount or when projectId changes
  useEffect(() => {
    // Skip if no projectId or already loaded this project
    if (!projectId || (hasLoaded.current && projectStore.selectedProject?.id === projectId)) {
      return;
    }

    const loadProject = async () => {
      try {
        await execute(async () => {
          // Only try to select if it's a different project
          if (!projectStore.selectedProject || projectStore.selectedProject.id !== projectId) {
            projectStore.selectProjectWithoutFetch(projectId);
          }
          return projectStore.selectedProject;
        });

        // Mark as loaded to prevent reloading
        hasLoaded.current = true;
      } catch (err) {
        console.error("Error loading project:", err);
      }
    };

    loadProject();

    // No cleanup function to avoid the infinite loop
  }, [projectId, execute]);

  const project = projectStore.selectedProject;

  // Define title actions that will appear in the top-right corner
  const titleActions = project && (
    <>
      <ViewOnGithub link={project.html_url || project.url || ""} />
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
      title={
        <Typography variant="h1" component="h1" gutterBottom>
          {project?.name || "Project"}
        </Typography>
      }
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

import { observer } from "mobx-react-lite";
import React from "react";
import { FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import ViewOnGithub from "@/common/components/composed/ViewOnGithubLink";
import PageContainer from "@/common/components/layout/PageContainer";
import { Button, Typography } from "@/common/components/ui";
import { ROUTES } from "@/common/routes";
import { ProjectColumns, ProjectRepositories } from "@/features/projects/components";
import { useProjectPage } from "@/features/projects/hooks/use-project-page";

const ProjectPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const { project, isLoading, error, projectNotFound } = useProjectPage();

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
      {project && !projectNotFound && (
        <>
          <ProjectColumns project={project} />
          <ProjectRepositories projectId={project.id} />
        </>
      )}
    </PageContainer>
  );
});

export default ProjectPage;

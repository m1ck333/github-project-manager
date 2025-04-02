import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiUsers } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

import Container from "@/common/components/layout/Container";
import Button from "@/common/components/ui/Button";
import ViewOnGithub from "@/common/components/composed/ViewOnGithubLink";
import { ProjectBoard } from "@/features/project/components/ProjectBoard";
import ProjectRepositories from "@/features/project/components/ProjectRepositories";
import { projectStore } from "@/stores";

import styles from "./ProjectPage.module.scss";

const ProjectPage: React.FC = observer(() => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      document.title = "Loading Project | Project Manager";

      // Projects are already loaded during app initialization
      // Just select the current project
      projectStore.selectProject(projectId);

      // Update title with project name
      if (projectStore.selectedProject) {
        document.title = `${projectStore.selectedProject.name} | Project Manager`;
      }

      setIsLoading(false);
    } catch (err) {
      setError((err as Error).message || "Failed to load project");
      document.title = "Error | Project Manager";
      setIsLoading(false);
    }

    // Clear selected project on unmount
    return () => {
      projectStore.clearSelectedProject();
    };
  }, [projectId]);

  const handleBack = () => {
    navigate("/projects");
  };

  if (isLoading) {
    return (
      <Container size="large" withPadding>
        <div className={styles.loading}>Loading project...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="large" withPadding>
        <div className={styles.error}>{error}</div>
      </Container>
    );
  }

  const project = projectStore.selectedProject;
  if (!project) {
    return (
      <Container size="large" withPadding>
        <div className={styles.error}>Project not found</div>
      </Container>
    );
  }

  return (
    <Container size="large" withPadding title={project.name}>
      <div className={styles.pageContent}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            <FiArrowLeft /> Back to Projects
          </button>
          <div className={styles.actions}>
            <ViewOnGithub link={project.url} />
            <Button
              variant="secondary"
              onClick={() => navigate(`/projects/${project.id}/collaborators`)}
            >
              <FiUsers /> Manage Collaborators
            </Button>
          </div>
        </div>

        <ProjectBoard project={project} />

        {/* Project Repositories Section */}
        <ProjectRepositories projectId={project.id} />
      </div>
    </Container>
  );
});

export default ProjectPage;

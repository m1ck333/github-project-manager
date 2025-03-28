import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiUsers } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

import { ProjectBoard } from "../../components/features/project/ProjectBoard";
import ProjectRepositories from "../../components/features/project/ProjectRepositories";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import { projectStore } from "../../store";

import styles from "./ProjectPage.module.scss";

const ProjectPage: React.FC = observer(() => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        document.title = "Loading Project | Project Manager";
        // If the project isn't in the store already, fetch it
        if (!projectStore.projects.find((p) => p.id === projectId)) {
          await projectStore.fetchProjects();
        }

        // Select the project
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
    };

    fetchProject();

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

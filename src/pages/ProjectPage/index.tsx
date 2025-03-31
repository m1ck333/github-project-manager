import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiUsers, FiInfo, FiExternalLink } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

import ViewOnGithub from "@/components/features/github/ViewOnGithubLink";

import { ProjectBoard } from "../../components/features/project/ProjectBoard";
import ProjectRepositories from "../../components/features/project/ProjectRepositories";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import InfoBox from "../../components/ui/InfoBox";
import { projectStore } from "../../store";

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

  // Check if project has real columns (not just the "No Status" column)
  const hasRealColumns = project.columns?.some((col) => col.id !== "no-status") || false;

  // Check if project has any issues
  const hasIssues = project.issues && project.issues.length > 0;

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

        {/* No columns message */}
        {!hasRealColumns && (
          <InfoBox variant="info" className={styles.noColumnsInfo}>
            <div className={styles.infoContent}>
              <FiInfo size={20} />
              <div>
                <h3>No Status Field Columns Found</h3>
                <p>
                  This GitHub Project doesn't appear to have any Status field columns set up. To
                  create columns, go to your GitHub project settings and add a Status field with
                  options like "Todo", "In Progress", and "Done".
                </p>
                <a
                  href={`${project.url}/settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.githubLink}
                >
                  <FiExternalLink /> Configure Project in GitHub
                </a>
              </div>
            </div>
          </InfoBox>
        )}

        {/* No issues message */}
        {hasRealColumns && !hasIssues && (
          <InfoBox variant="info" className={styles.noColumnsInfo}>
            <div className={styles.infoContent}>
              <FiInfo size={20} />
              <div>
                <h3>No Issues Found</h3>
                <p>
                  This project has columns but no issues have been added yet. Create issues in
                  GitHub and add them to this project to see them here.
                </p>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.githubLink}
                >
                  <FiExternalLink /> Go to GitHub Project
                </a>
              </div>
            </div>
          </InfoBox>
        )}

        <ProjectBoard project={project} />

        {/* Project Repositories Section */}
        <ProjectRepositories projectId={project.id} />
      </div>
    </Container>
  );
});

export default ProjectPage;

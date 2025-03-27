import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import ProjectList from "../../components/features/ProjectList";
import Loading from "../../components/ui/Loading";
import Error from "../../components/ui/Error";
import Container from "../../components/layout/Container";
import { projectStore } from "../../store";
import styles from "./ProjectsPage.module.scss";

const Projects: React.FC = observer(() => {
  const { projects, loading, error } = projectStore;

  useEffect(() => {
    projectStore.fetchProjects();
  }, []);

  const handleRetry = () => {
    projectStore.fetchProjects();
  };

  return (
    <Container size="large" withPadding title="My GitHub Projects">
      <div className={styles.projectsWrapper}>
        {loading ? (
          <Loading text="Loading projects..." />
        ) : error ? (
          <Error message={error} retry={handleRetry} />
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>
    </Container>
  );
});

export default React.memo(Projects);

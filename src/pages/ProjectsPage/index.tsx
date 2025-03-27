import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import ProjectList from "../../components/features/project/ProjectList";
import Loading from "../../components/ui/Loading";
import Error from "../../components/ui/Error";
import Input from "../../components/ui/Input";
import Container from "../../components/layout/Container";
import { projectStore } from "../../store";
import styles from "./ProjectsPage.module.scss";

const Projects: React.FC = observer(() => {
  const { projects, loading, error } = projectStore;
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Projects | Project Manager";
    projectStore.fetchProjects();
  }, []);

  const handleRetry = () => {
    projectStore.fetchProjects();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredProjects = projects.filter((project) => {
    return (
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.owner.login.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Container size="large" withPadding title="Projects">
      <div className={styles.projectsWrapper}>
        {!loading && !error && (
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        )}

        {loading ? (
          <Loading text="Loading projects..." />
        ) : error ? (
          <Error message={error} retry={handleRetry} />
        ) : (
          <ProjectList projects={filteredProjects} />
        )}
      </div>
    </Container>
  );
});

export default React.memo(Projects);

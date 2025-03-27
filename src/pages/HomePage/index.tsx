import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import Button from "../../components/ui/Button";
import Container from "../../components/layout/Container";
import { projectStore, repositoryStore } from "../../store";
import { FiFolder, FiGithub } from "react-icons/fi";
import styles from "./HomePage.module.scss";

const Home: React.FC = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set document title
    document.title = "GitHub Project Manager";

    // Load initial data when the home page loads
    const loadInitialData = async () => {
      try {
        // Load projects if they're not already loaded
        if (projectStore.projects.length === 0) {
          await projectStore.fetchProjects();
        }

        // Load repositories if they're not already loaded
        if (repositoryStore.repositories.length === 0) {
          await repositoryStore.fetchUserRepositories();
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  return (
    <Container size="small" withPadding title="Welcome to GitHub Project Manager">
      <div className={styles.content}>
        <p>
          This application helps you manage your GitHub projects and repositories efficiently. You
          can create and manage projects, track work through different status columns, and manage
          repository collaborators.
        </p>

        <div className={styles.stats}>
          <div className={styles.statCard} onClick={() => navigate("/projects")}>
            <div className={styles.statIcon}>
              <FiFolder size={24} />
            </div>
            <div className={styles.statInfo}>
              <h3>{projectStore.projects.length}</h3>
              <p>Projects</p>
            </div>
          </div>

          <div className={styles.statCard} onClick={() => navigate("/repositories")}>
            <div className={styles.statIcon}>
              <FiGithub size={24} />
            </div>
            <div className={styles.statInfo}>
              <h3>{repositoryStore.repositories.length}</h3>
              <p>Repositories</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate("/projects")} size="large">
            View My Projects
          </Button>
          <Button variant="primary" onClick={() => navigate("/repositories")} size="large">
            Manage Repositories
          </Button>
        </div>
      </div>
    </Container>
  );
});

export default Home;

import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { FiFolder, FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import GitHubTokenWarning from "../../components/features/github/GitHubTokenWarning";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import { useAppInitialization } from "../../hooks/useAppInitialization";
import { userStore, projectStore, repositoryStore } from "../../store";

import styles from "./HomePage.module.scss";

const HomePage: React.FC = observer(() => {
  const navigate = useNavigate();
  useAppInitialization();

  useEffect(() => {
    // Set document title
    document.title = "GitHub Project Manager";
  }, []);

  const hasToken = userStore.hasToken();
  const projectCount = projectStore.projects.length;
  const repositoryCount = repositoryStore.repositories.length;

  return (
    <Container className={styles.homePage}>
      <div className={styles.hero}>
        <h1 className={styles.title}>GitHub Project Manager</h1>
        <p className={styles.subtitle}>Manage your GitHub repositories and projects in one place</p>

        {!hasToken && <GitHubTokenWarning />}

        <div className={styles.buttonGrid}>
          <Button
            variant="primary"
            size="large"
            onClick={() => navigate("/projects")}
            className={styles.button}
          >
            <FiFolder className={styles.buttonIcon} /> View Projects
            {projectCount > 0 && <span className={styles.counter}>{projectCount}</span>}
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={() => navigate("/repositories")}
            className={styles.button}
          >
            <FiGithub className={styles.buttonIcon} /> View Repositories
            {repositoryCount > 0 && <span className={styles.counter}>{repositoryCount}</span>}
          </Button>
        </div>
      </div>
    </Container>
  );
});

export default HomePage;

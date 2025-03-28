import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { FiFolder, FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import GitHubTokenWarning from "../../components/features/github/GitHubTokenWarning";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import { userService } from "../../graphql/services";
import { useAppInitialization } from "../../hooks/useAppInitialization";

import styles from "./HomePage.module.scss";

const Home: React.FC = observer(() => {
  const navigate = useNavigate();
  useAppInitialization();

  useEffect(() => {
    // Set document title
    document.title = "GitHub Project Manager";
  }, []);

  const hasToken = userService.hasToken();

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
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={() => navigate("/repositories")}
            className={styles.button}
          >
            <FiGithub className={styles.buttonIcon} /> View Repositories
          </Button>
        </div>
      </div>
    </Container>
  );
});

export default Home;

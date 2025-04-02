import { observer } from "mobx-react-lite";
import React from "react";
import { FiFolder, FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import PageContainer from "@/common/components/layout/PageContainer";
import Button from "@/common/components/ui/Button";
import { useAppInitialization } from "@/common/hooks/useAppInitialization";
import { env } from "@/config/env";
import GitHubTokenWarning from "@/features/home/components/GitHubTokenWarning";
import { userStore, projectStore, repositoryStore } from "@/stores";

import styles from "./HomePage.module.scss";

const HomePage: React.FC = observer(() => {
  const navigate = useNavigate();
  useAppInitialization();

  const hasToken = userStore.hasToken();
  const projectCount = projectStore.projects.length;
  const repositoryCount = repositoryStore.repositories.length;

  return (
    <PageContainer className={styles.homePage} fluid={true}>
      <div className={styles.hero}>
        <h1 className={styles.title}>{env.appName}</h1>
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
    </PageContainer>
  );
});

export default HomePage;

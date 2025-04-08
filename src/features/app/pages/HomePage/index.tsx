import { observer } from "mobx-react-lite";
import React from "react";
import { FiFolder, FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import PageContainer from "@/common/components/layout/PageContainer";
import { Button, Typography } from "@/common/components/ui";
import { env } from "@/common/config/env";
import GitHubTokenWarning from "@/features/app/components/GitHubTokenWarning";
import { projectStore } from "@/features/projects/stores";
import { repositoryStore } from "@/features/repositories/stores";
import { userService } from "@/features/user/api";

import styles from "./home-page.module.scss";

const HomePage: React.FC = observer(() => {
  const navigate = useNavigate();

  const hasToken = userService.hasToken();
  const projectCount = projectStore.projects.length;
  const repositoryCount = repositoryStore.repositories.length;

  return (
    <PageContainer className={styles.homePage} fluid={true}>
      <div className={styles.hero}>
        <Typography variant="h1" className={styles.title}>
          {env.appName}
        </Typography>
        <Typography variant="body1" className={styles.subtitle}>
          Manage your GitHub repositories and projects in one place
        </Typography>

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

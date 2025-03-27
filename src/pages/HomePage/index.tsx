import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Container from "../../components/layout/Container";
import styles from "./HomePage.module.scss";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container size="small" withPadding title="Welcome to GitHub Project Manager">
      <div className={styles.content}>
        <p>
          This application helps you manage your GitHub projects efficiently. You can create and
          manage projects, add boards, create issues with labels, and track work through different
          status columns.
        </p>

        <div className={styles.actions}>
          <Button variant="primary" onClick={() => navigate("/projects")} size="large">
            View My Projects
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Home;

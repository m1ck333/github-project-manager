import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import styles from "./HomePage.module.scss";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1>Welcome to GitHub Project Manager</h1>
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
  );
};

export default Home;

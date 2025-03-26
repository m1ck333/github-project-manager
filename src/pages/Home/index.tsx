import React from "react";
import styles from "./Home.module.scss";

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Welcome to GitHub Project Manager</h1>
      <p>
        This application helps you manage your GitHub projects efficiently. Navigate to the Projects
        page to view and manage your GitHub projects.
      </p>
    </div>
  );
};

export default Home;

import React, { useState } from "react";
import ProjectForm from "./components/features/ProjectForm";
import Button from "./components/ui/Button";
import styles from "./App.module.scss";

function App() {
  const [showProjectForm, setShowProjectForm] = useState(false);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>GitHub Project Manager</h1>
        <Button variant="primary" onClick={() => setShowProjectForm(true)}>
          Create Project
        </Button>
      </header>

      <main className={styles.main}>
        {showProjectForm ? (
          <ProjectForm
            onSuccess={() => setShowProjectForm(false)}
            onCancel={() => setShowProjectForm(false)}
          />
        ) : (
          <div className={styles.content}>
            {/* Project list will go here */}
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

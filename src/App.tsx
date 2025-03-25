import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import ProjectForm from "./components/features/ProjectForm";
import ProjectList from "./components/features/ProjectList";
import Button from "./components/ui/Button";
import Loading from "./components/ui/Loading";
import Error from "./components/ui/Error";
import { projectStore } from "./store/ProjectStore";
import styles from "./App.module.scss";

const App: React.FC = observer(() => {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const { projects, loading, error } = projectStore;

  // For demo purposes only - would normally fetch from API
  // In a real implementation, we would call projectStore.fetchProjects()

  const handleRetry = () => {
    // This would call projectStore.fetchProjects() in a real implementation
    console.log("Retrying fetch projects...");
  };

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
            {loading ? (
              <Loading text="Loading projects..." />
            ) : error ? (
              <Error message={error} retry={handleRetry} />
            ) : projects.length > 0 ? (
              <ProjectList projects={projects} />
            ) : (
              <p>No projects yet. Create your first project to get started!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
});

export default App;

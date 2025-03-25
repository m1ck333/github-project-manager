import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import ProjectForm from "./components/features/ProjectForm";
import ProjectList from "./components/features/ProjectList";
import Loading from "./components/ui/Loading";
import Error from "./components/ui/Error";
import Layout from "./components/layout/Layout";
import { projectStore } from "./store/ProjectStore";

const App: React.FC = observer(() => {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const { projects, loading, error } = projectStore;

  const handleRetry = () => {
    projectStore.fetchProjects();
  };

  return (
    <Layout title="GitHub Project Manager" onCreateClick={() => setShowProjectForm(true)}>
      {showProjectForm ? (
        <ProjectForm
          onSuccess={() => setShowProjectForm(false)}
          onCancel={() => setShowProjectForm(false)}
        />
      ) : (
        <div className="content-container">
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
    </Layout>
  );
});

export default App;

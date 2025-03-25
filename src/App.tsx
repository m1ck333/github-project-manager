import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import ProjectList from "./components/features/ProjectList";
import Loading from "./components/ui/Loading";
import Error from "./components/ui/Error";
import Layout from "./components/layout/Layout";
import { projectStore } from "./store";

const App: React.FC = observer(() => {
  const { projects, loading, error } = projectStore;

  useEffect(() => {
    projectStore.fetchProjects();
  }, []);

  const handleRetry = () => {
    projectStore.fetchProjects();
  };

  return (
    <Layout>
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
    </Layout>
  );
});

export default App;

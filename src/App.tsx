import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Button from "./components/ui/Button";
import InfoBox from "./components/ui/InfoBox";
import Loading from "./components/ui/Loading";
import { ToastProvider } from "./components/ui/Toast";
import { useAppInitialization } from "./hooks/useAppInitialization";
import CollaboratorsPage from "./pages/CollaboratorsPage";
import Home from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import Projects from "./pages/ProjectsPage";
import RepositoriesPage from "./pages/RepositoriesPage";
import RepositoryPage from "./pages/RepositoryPage";

// Extract routes to a separate component with keys
const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:projectId" element={<ProjectPage />} />
      <Route path="/projects/:projectId/collaborators" element={<CollaboratorsPage />} />
      <Route path="/repositories" element={<RepositoriesPage />} />
      <Route path="/repositories/:owner/:name" element={<RepositoryPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const { isInitializing, error, retryInitialization } = useAppInitialization();

  if (isInitializing) {
    return (
      <div className="initializingContainer">
        <Loading text="Initializing application..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="initializingContainer">
        <InfoBox variant="error" title="Initialization Error">
          <p>{error}</p>
          <Button variant="secondary" size="small" onClick={retryInitialization}>
            Retry
          </Button>
        </InfoBox>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

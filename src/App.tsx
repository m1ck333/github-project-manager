import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Layout from "./components/layout/Layout";
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
  return (
    <Router>
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
};

export default App;

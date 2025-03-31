import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";

import CollaboratorsPage from "../../../pages/CollaboratorsPage";
import Home from "../../../pages/HomePage";
import ProjectPage from "../../../pages/ProjectPage";
import Projects from "../../../pages/ProjectsPage";
import RepositoriesPage from "../../../pages/RepositoriesPage";
import RepositoryPage from "../../../pages/RepositoryPage";
import { FullPageError } from "../../ui/ErrorBanner";

const ErrorBoundaryRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);

  // Reset error when location changes
  useEffect(() => {
    setError(null);
  }, [location.pathname]);

  // Global error handler
  useEffect(() => {
    // Save original console.error
    const originalConsoleError = console.error;

    // Create error handler
    const handleError = (event: ErrorEvent) => {
      setError(event.error || new Error("An unexpected application error occurred"));
      event.preventDefault();
    };

    // Handler for unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      setError(event.reason || new Error("Unhandled Promise Rejection"));
    };

    // Override console.error to catch React errors
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError(...args);

      // Check if this is a React error
      const errorMessage = args.join(" ");
      if (
        errorMessage.includes("React") ||
        errorMessage.includes("Error") ||
        errorMessage.includes("Exception")
      ) {
        setError(new Error(errorMessage));
      }
    };

    // Add event listeners
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    // Clean up
    return () => {
      console.error = originalConsoleError;
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (error) {
    return (
      <FullPageError
        error={error}
        onRetry={() => {
          setError(null);
          window.location.reload();
        }}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              setError(null);
              navigate("/");
            }}
          >
            Go to Home
          </Button>
        }
      />
    );
  }

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

export default ErrorBoundaryRoutes;

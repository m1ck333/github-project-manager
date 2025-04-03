import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Button from "@/common/components/ui/display/Button";
import Error from "@/common/components/ui/feedback/Error";
import { getErrorMessage } from "@/common/utils/errors";
import CollaboratorsPage from "@/features/collaborators/pages/CollaboratorsPage";
import Home from "@/features/home/pages/HomePage";
import ProjectPage from "@/features/projects/pages/ProjectPage";
import ProjectsPage from "@/features/projects/pages/ProjectsPage";
import RepositoriesPage from "@/features/repositories/pages/RepositoriesPage";
import RepositoryPage from "@/features/repositories/pages/RepositoryPage";

import { ROUTES } from "../../../constants/routes";

const ErrorBoundaryRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

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
      setError(
        event.error ? getErrorMessage(event.error) : "An unexpected application error occurred"
      );
      event.preventDefault();
    };

    // Handler for unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      setError(
        event.reason instanceof Error
          ? getErrorMessage(event.reason)
          : String(event.reason) || "Unhandled Promise Rejection"
      );
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
        setError(errorMessage);
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
      <Error
        error={error}
        title="Application Error"
        fullPage={true}
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
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.PROJECTS} element={<ProjectsPage />} />
      <Route path={ROUTES.PROJECT_DETAIL()} element={<ProjectPage />} />
      <Route path={ROUTES.PROJECT_COLLABORATORS()} element={<CollaboratorsPage />} />
      <Route path={ROUTES.REPOSITORIES} element={<RepositoriesPage />} />
      <Route path={ROUTES.REPOSITORY_DETAIL()} element={<RepositoryPage />} />
    </Routes>
  );
};

export default ErrorBoundaryRoutes;

import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Button from "@/common/components/ui/display/Button";
import Error from "@/common/components/ui/feedback/Error";
import { getErrorMessage } from "@/common/utils/errors.utils";
import { HomePage } from "@/features/app";
import CollaboratorsPage from "@/features/collaborators/pages/CollaboratorsPage";
import ProjectPage from "@/features/projects/pages/ProjectPage";
import ProjectsPage from "@/features/projects/pages/ProjectsPage";
import RepositoriesPage from "@/features/repositories/pages/RepositoriesPage";
import RepositoryPage from "@/features/repositories/pages/RepositoryPage";

import { ROUTE_PATHS } from "./config/routes";

/**
 * Main application routes component with error boundary functionality
 * Handles route definitions and global error handling
 */
const AppRoutes: React.FC = () => {
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

      // Check if this is a React error - but AVOID infinite loop errors
      const errorMessage = args.join(" ");
      if (
        (errorMessage.includes("React") ||
          errorMessage.includes("Error") ||
          errorMessage.includes("Exception")) &&
        // Skip Maximum update depth exceeded errors to avoid infinite loops
        !errorMessage.includes("Maximum update depth exceeded") &&
        !errorMessage.includes("infinite loop") &&
        !errorMessage.includes("setState inside useEffect")
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
    <Routes>
      {/* Main routes */}
      <Route path={ROUTE_PATHS.HOME} element={<HomePage />} />

      {/* Project routes */}
      <Route path={ROUTE_PATHS.PROJECTS} element={<ProjectsPage />} />
      <Route path={ROUTE_PATHS.PROJECT_DETAIL} element={<ProjectPage />} />
      <Route path={ROUTE_PATHS.PROJECT_COLLABORATORS} element={<CollaboratorsPage />} />

      {/* Repository routes */}
      <Route path={ROUTE_PATHS.REPOSITORIES} element={<RepositoriesPage />} />
      <Route path={ROUTE_PATHS.REPOSITORY_DETAIL} element={<RepositoryPage />} />

      {/* Fallback route */}
      <Route
        path="*"
        element={
          <Error
            error="The page you requested does not exist"
            title="Page Not Found"
            fullPage={true}
            actions={
              <Button variant="primary" onClick={() => navigate(ROUTE_PATHS.HOME)}>
                Go to Home
              </Button>
            }
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;

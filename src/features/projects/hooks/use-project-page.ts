import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAsync } from "@/common/hooks";
import { ROUTES } from "@/common/routes";
import { projectStore } from "@/features/projects/stores";

export interface UseProjectPageReturn {
  project: typeof projectStore.selectedProject;
  isLoading: boolean;
  error: unknown;
  projectNotFound: boolean;
}

export function useProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const hasLoaded = useRef(false);
  const [projectNotFound, setProjectNotFound] = useState(false);

  const { isLoading, error, execute } = useAsync();

  useEffect(() => {
    if (!projectId || (hasLoaded.current && projectStore.selectedProject?.id === projectId)) {
      return;
    }

    const loadProject = async () => {
      try {
        await execute(async () => {
          if (!projectStore.selectedProject || projectStore.selectedProject.id !== projectId) {
            projectStore.selectProject(projectId);
          }

          if (!projectStore.selectedProject) {
            setProjectNotFound(true);
            throw new Error("Project not found");
          }

          return projectStore.selectedProject;
        });

        hasLoaded.current = true;
      } catch (err) {
        console.error("Error loading project:", err);
        if (!projectStore.selectedProject) {
          setProjectNotFound(true);
        }
      }
    };

    loadProject();

    // No cleanup function to avoid the infinite loop
  }, [projectId, execute]);

  // Redirect back to projects list if project not found
  useEffect(() => {
    if (projectNotFound && !isLoading) {
      navigate(ROUTES.PROJECTS);
    }
  }, [projectNotFound, isLoading, navigate]);

  // Custom error message
  const customError = projectNotFound
    ? "Project not found. Redirecting to projects list..."
    : error;

  return {
    project: projectStore.selectedProject,
    isLoading,
    error: customError,
    projectNotFound,
  };
}

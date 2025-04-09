import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/common/components/ui";
import { useAsync } from "@/common/hooks";
import { ROUTES } from "@/common/routes";
import { projectStore } from "@/features/projects/stores";

export interface UseProjectPageReturn {
  project: typeof projectStore.selectedProject;
  isLoading: boolean;
  error: unknown;
  projectNotFound: boolean;
}

export function useProjectPage(): UseProjectPageReturn {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const hasLoaded = useRef(false);
  const [projectNotFound, setProjectNotFound] = useState(false);

  const { isLoading, error, execute } = useAsync();

  // Load project when projectId changes or if not loaded yet
  useEffect(() => {
    // Skip if no projectId or if we already loaded this project
    if (!projectId || (hasLoaded.current && projectStore.selectedProject?.id === projectId)) {
      return;
    }

    const loadProject = async () => {
      try {
        await execute(async () => {
          // Select project in store if needed
          if (!projectStore.selectedProject || projectStore.selectedProject.id !== projectId) {
            projectStore.selectProject(projectId);
          }

          // Handle case when project is not found
          if (!projectStore.selectedProject) {
            setProjectNotFound(true);
            throw new Error("Project not found");
          }

          hasLoaded.current = true;
          return projectStore.selectedProject;
        });
      } catch (err) {
        console.error("Error loading project:", err);
        if (!projectStore.selectedProject) {
          setProjectNotFound(true);
          // Show toast for better UX when project is not found
          showToast("Project not found. Redirecting to projects list...", "error");
        }
      }
    };

    loadProject();
  }, [projectId, execute, showToast]);

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

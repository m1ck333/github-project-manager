import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/common/components/ui";
import { useAsync } from "@/common/hooks";
import { useDebounce } from "@/common/hooks/use-debounce";
import { ROUTES } from "@/common/routes";
import { withToast } from "@/common/utils";
import { Projects } from "@/features/projects";
import type { Project, ProjectFormData } from "@/features/projects";
import { useProjectConfirmation } from "@/features/projects/hooks";
import { searchProjectText } from "@/features/projects/utils/search-engine.utils";

export interface UseProjectsPageReturn {
  // State
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  showCreateModal: boolean;
  selectedProject: Project | null;
  filteredProjects: Project[];
  confirmState: ReturnType<typeof useProjectConfirmation>["confirmState"];

  // Actions
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRefreshProjects: () => Promise<void>;
  handleNavigateToProject: (projectId: string) => void;
  handleCreateProject: (projectData: ProjectFormData) => Promise<Project | null | undefined>;
  handleEditProject: (project: Project) => void;
  handleUpdateProject: (projectData: ProjectFormData) => Promise<Project | null | undefined>;
  handleDeleteProject: (project: Project) => Promise<void>;
  setShowCreateModal: (show: boolean) => void;
  setSelectedProject: (project: Project | null) => void;
}

export function useProjectsPage(): UseProjectsPageReturn {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isLoading, error, execute } = useAsync();
  const { confirmState, confirmDeleteProject } = useProjectConfirmation();

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get all projects from the store
  const allProjects = Projects.store.projects;

  // Filter projects based on search query
  const filteredProjects = useMemo(
    () =>
      allProjects.filter((project) => {
        if (!debouncedSearchQuery) return true;
        return searchProjectText(project, debouncedSearchQuery);
      }),
    [allProjects, debouncedSearchQuery]
  );

  // Initial data loading
  useEffect(() => {
    if (allProjects.length === 0 && !isLoading) {
      handleRefreshProjects();
    }
  }, []);

  // Handler for refreshing projects list
  const handleRefreshProjects = async () => {
    await execute(async () => {
      await Projects.store.fetchProjects(true);
    });
  };

  // Handler for navigating to a specific project
  const handleNavigateToProject = (projectId: string) => {
    navigate(`${ROUTES.PROJECTS}/${projectId}`);
  };

  // Handler for creating a new project
  const handleCreateProject = async (projectData: ProjectFormData) => {
    return withToast(
      execute,
      showToast,
      async () => {
        const newProject = await Projects.store.createProject(projectData);
        setShowCreateModal(false);
        return newProject;
      },
      `Project "${projectData.name}" created successfully`
    );
  };

  // Handle editing a project
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
  };

  // Handle saving edited project
  const handleUpdateProject = async (projectData: ProjectFormData) => {
    if (!selectedProject) return null;

    return withToast(
      execute,
      showToast,
      async () => {
        const updatedProject = await Projects.store.updateProject(selectedProject.id, projectData);
        setSelectedProject(null);
        return updatedProject;
      },
      `Project "${projectData.name}" updated successfully`
    );
  };

  // Handle deleting a project with confirmation
  const handleDeleteProject = async (project: Project) => {
    const confirmed = await confirmDeleteProject(project.name);

    if (confirmed) {
      await withToast(
        execute,
        showToast,
        async () => {
          await Projects.store.deleteProject(project.id);
        },
        `Project "${project.name}" deleted successfully`
      );
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return {
    // State
    isLoading,
    error: error ? String(error) : null,
    searchQuery,
    showCreateModal,
    selectedProject,
    filteredProjects,
    confirmState,

    // Actions
    handleSearchChange,
    handleRefreshProjects,
    handleNavigateToProject,
    handleCreateProject,
    handleEditProject,
    handleUpdateProject,
    handleDeleteProject,
    setShowCreateModal,
    setSelectedProject,
  };
}

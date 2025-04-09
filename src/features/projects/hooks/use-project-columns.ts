import { useToast } from "@/common/components/ui";
import { useAsync } from "@/common/hooks";
import { useColumns } from "@/features/columns/hooks/use-columns";
import { useIssues } from "@/features/issues/hooks/use-issues";
import { projectStore } from "@/features/projects/stores";
import { Project } from "@/features/projects/types";

export interface UseProjectColumnsProps {
  project: Project;
}

export const useProjectColumns = ({ project }: UseProjectColumnsProps) => {
  const { showToast } = useToast();
  const refreshAsync = useAsync();

  // Use specialized hooks for issues and columns
  const issuesHook = useIssues({
    projectId: project.id,
    issues: project.issues || [],
  });

  const columnsHook = useColumns({
    columns: project.columns || [],
  });

  // Refresh project data
  const refreshProjectData = async () => {
    const success = await refreshAsync.execute(async () => {
      await projectStore.selectProject(project.id);
      showToast("Project data refreshed", "success");
      return true;
    });
    return success;
  };

  return {
    // Project data
    project,

    // Issues-related functionality (all from the issues hook)
    ...issuesHook,

    // Columns-related functionality (all from the columns hook)
    ...columnsHook,

    // Project-specific functionality
    refreshProjectData,
    isRefreshing: refreshAsync.isLoading,
    refreshError: refreshAsync.error,
  };
};

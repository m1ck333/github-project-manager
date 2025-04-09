import { useToast } from "@/common/components/ui";
import { useAsync } from "@/common/hooks";
import { withToast } from "@/common/utils";
import { useColumns } from "@/features/columns/hooks/use-columns";
import { useIssues } from "@/features/issues/hooks/use-issues";
import { projectStore } from "@/features/projects/stores";
import { Project } from "@/features/projects/types";

export interface UseProjectColumnsProps {
  project: Project;
}

export const useProjectColumns = ({ project }: UseProjectColumnsProps) => {
  const { showToast } = useToast();
  const { execute, isLoading: isRefreshing, error: refreshError } = useAsync();

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
    return withToast(
      execute,
      showToast,
      async () => {
        projectStore.selectProject(project.id);
        return true;
      },
      "Project data refreshed"
    );
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
    isRefreshing,
    refreshError,
  };
};

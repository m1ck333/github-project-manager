import React from "react";

import GridCardAdd from "@/common/components/composed/grid/GridCardAdd";
import { EmptyState } from "@/common/components/ui";
import { Stack } from "@/common/components/ui/display";
import ProjectCard from "@/features/projects/components/molecules/ProjectCard";
import { Project } from "@/features/projects/types";

import styles from "./project-grid.module.scss";

interface ProjectGridProps {
  projects: Project[];
  onNavigateToProject: (projectId: string) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onNavigateToProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
}) => {
  const renderEmptyState = () => (
    <EmptyState title="No projects found" description="Create a new project to get started" />
  );

  return (
    <Stack className={styles.gridContainer} wrap>
      {/* Add Project Card */}
      <GridCardAdd label="Create Project" onClick={onCreateProject} />

      {/* Project Cards */}
      {projects.length === 0
        ? renderEmptyState()
        : projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onNavigateToProject(project.id)}
              onEdit={onEditProject}
              onDelete={onDeleteProject}
            />
          ))}
    </Stack>
  );
};

export default ProjectGrid;

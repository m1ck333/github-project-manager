import React from "react";
import { FiEdit, FiTrash2, FiBook } from "react-icons/fi";

import GridCard from "@/common/components/composed/grid/GridCard";
import GridCardAdd from "@/common/components/composed/grid/GridCardAdd";
import { EmptyState } from "@/common/components/ui";
import { Project } from "@/features/projects/types";

import styles from "./project-grid.module.scss";

interface ProjectGridProps {
  projects: Project[];
  onNavigateToProject: (id: string) => void;
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
    <div className={styles.gridContainer}>
      {/* Add Project Card */}
      <GridCardAdd label="Create Project" onClick={onCreateProject} />

      {/* Project Cards */}
      {projects.length === 0
        ? renderEmptyState()
        : projects.map((project) => (
            <GridCard
              key={project.id}
              title={project.name}
              description={project.description || "No description provided"}
              onClick={() => onNavigateToProject(project.id)}
              stats={[
                {
                  icon: <FiBook size={14} />,
                  text: `${project.repositories?.length || 0} Repositories`,
                },
              ]}
              actions={[
                {
                  icon: <FiEdit size={16} />,
                  label: "Edit",
                  onClick: (e) => {
                    e.stopPropagation();
                    onEditProject(project);
                  },
                },
                {
                  icon: <FiTrash2 size={16} />,
                  label: "Delete",
                  onClick: (e) => {
                    e.stopPropagation();
                    onDeleteProject(project);
                  },
                },
              ]}
              createdAt={project.createdAt}
              htmlUrl={project.html_url}
              viewPath={`/projects/${project.id}`}
              className={styles.projectCard}
            />
          ))}
    </div>
  );
};

export default ProjectGrid;

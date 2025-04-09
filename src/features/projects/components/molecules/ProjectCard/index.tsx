import React from "react";
import { FiGitBranch, FiList, FiEdit2, FiTrash2 } from "react-icons/fi";

import GridCard from "@/common/components/composed/grid/GridCard";
import { Project } from "@/features/projects/types";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onEdit, onDelete }) => {
  return (
    <GridCard
      title={project.name}
      description={project.description || "No description provided"}
      onClick={onClick}
      stats={[
        {
          icon: <FiGitBranch size={14} />,
          text: `${project.repositories?.length || 0} ${
            project.repositories?.length === 1 ? "Repository" : "Repositories"
          }`,
        },
        {
          icon: <FiList size={14} />,
          text: `${project.issues?.length || 0} ${
            project.issues?.length === 1 ? "Issue" : "Issues"
          }`,
        },
      ]}
      actions={[
        {
          icon: <FiEdit2 size={16} />,
          label: "Edit",
          onClick: (e) => {
            e.stopPropagation();
            onEdit(project);
          },
        },
        {
          icon: <FiTrash2 size={16} />,
          label: "Delete",
          onClick: (e) => {
            e.stopPropagation();
            onDelete(project);
          },
        },
      ]}
      createdAt={project.createdAt}
      htmlUrl={project.html_url}
      viewPath={`/projects/${project.id}`}
    />
  );
};

export default ProjectCard;

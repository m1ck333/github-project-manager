import React from "react";
import { FiGithub, FiEdit, FiTrash2 } from "react-icons/fi";

import GridCard from "../../../../common/components/composed/grid/GridCard";
import { Project } from "../../../../types";

import styles from "./ProjectCard.module.scss";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onEdit, onDelete }) => {
  // Build the actions array
  const cardActions = [
    {
      icon: <FiEdit size={16} />,
      label: "Edit",
      ariaLabel: "Edit project",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(project);
      },
    },
    {
      icon: <FiTrash2 size={16} />,
      label: "Delete",
      ariaLabel: "Delete project",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(project);
      },
    },
  ];

  return (
    <GridCard
      title={project.name}
      subtitle={project.owner.login}
      description={project.description || "No description provided"}
      avatar={{
        src: project.owner.avatar_url,
        alt: project.owner.login,
      }}
      stats={[
        {
          icon: <FiGithub size={14} />,
          text: `${project.repositories?.length || 0} Repositories`,
        },
      ]}
      actions={cardActions}
      createdAt={project.createdAt}
      htmlUrl={project.html_url}
      viewPath={`/projects/${project.id}`}
      onClick={onClick}
      className={styles.projectCard}
    />
  );
};

export default ProjectCard;

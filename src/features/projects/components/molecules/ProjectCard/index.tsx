import React from "react";
import { FiEdit2, FiTrash2, FiGitBranch, FiList } from "react-icons/fi";

import { Button } from "@/common/components/ui";
import { Project } from "@/features/projects/types";

import styles from "./ProjectCard.module.scss";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onEdit, onDelete }) => {
  // Prevent event bubbling when clicking edit or delete
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project);
  };

  return (
    <div className={styles.projectCard} onClick={onClick}>
      <div className={styles.projectHeader}>
        <h3 className={styles.projectName}>{project.name}</h3>
        <div className={styles.actionButtons}>
          <Button
            variant="secondary"
            onClick={handleEdit}
            title="Edit project"
            className={styles.editButton}
          >
            <FiEdit2 size={16} />
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelete}
            title="Delete project"
            className={styles.deleteButton}
          >
            <FiTrash2 size={16} />
          </Button>
        </div>
      </div>

      {project.description && <p className={styles.projectDescription}>{project.description}</p>}

      <div className={styles.projectInfo}>
        <div className={styles.infoItem}>
          <FiGitBranch />
          <span>
            {project.repositories?.length || 0}{" "}
            {project.repositories?.length === 1 ? "repo" : "repos"}
          </span>
        </div>
        <div className={styles.infoItem}>
          <FiList />
          <span>
            {project.issues?.length || 0} {project.issues?.length === 1 ? "issue" : "issues"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

import React from "react";
import { FiEdit2, FiTrash2, FiGitBranch, FiList, FiCalendar } from "react-icons/fi";

import { Button } from "@/common/components/ui";
import Typography from "@/common/components/ui/display/Typography";
import { formatDate } from "@/common/utils/date.utils";
import { Project } from "@/features/projects/types";

import styles from "./project-card.module.scss";

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
        <Typography variant="h3" className={styles.projectName}>
          {project.name}
        </Typography>
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

      {project.description && (
        <Typography variant="body2" className={styles.projectDescription}>
          {project.description}
        </Typography>
      )}

      <div className={styles.projectInfo}>
        <div className={styles.infoItem}>
          <FiGitBranch />
          <Typography variant="body2" component="span">
            {project.repositories?.length || 0}{" "}
            {project.repositories?.length === 1 ? "repo" : "repos"}
          </Typography>
        </div>
        <div className={styles.infoItem}>
          <FiList />
          <Typography variant="body2" component="span">
            {project.issues?.length || 0} {project.issues?.length === 1 ? "issue" : "issues"}
          </Typography>
        </div>
        {project.createdAt && (
          <div className={styles.infoItem}>
            <FiCalendar />
            <Typography variant="caption" component="span">
              Created on {formatDate(project.createdAt)}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;

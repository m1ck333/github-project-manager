import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Project } from "../../../types";
import Button from "../../ui/Button";
import styles from "./ProjectList.module.scss";

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = observer(({ projects }) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const toggleProject = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <div className={styles.projectList}>
      <h2>Your Projects</h2>
      {projects.map((project) => (
        <div key={project.id} className={styles.projectCard}>
          <div className={styles.projectHeader}>
            <h3 onClick={() => toggleProject(project.id)}>{project.name}</h3>
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => alert("Board creation would go here")}>
                Add Board
              </Button>
              <Button variant="secondary" onClick={() => alert("Label creation would go here")}>
                Add Label
              </Button>
              <Button variant="secondary" onClick={() => alert("Issue creation would go here")}>
                Add Issue
              </Button>
            </div>
          </div>

          {expandedProject === project.id && (
            <div className={styles.projectDetails}>
              {project.description && <p className={styles.description}>{project.description}</p>}

              <div className={styles.boardsSection}>
                <h4>Boards</h4>
                {project.boards && project.boards.length > 0 ? (
                  <div className={styles.boardsList}>
                    {project.boards.map((board) => (
                      <div key={board.id} className={styles.boardCard}>
                        <h5>{board.name}</h5>
                        {/* Board details can be expanded here */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No boards yet. Create your first board.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

export default ProjectList;

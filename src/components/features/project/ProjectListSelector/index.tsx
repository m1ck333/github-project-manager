import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Project } from "../../../../types";
import { projectStore } from "../../../../store";
import Button from "../../../ui/Button";
import styles from "./ProjectListSelector.module.scss";

interface ProjectListSelectorProps {
  repositoryId: string;
  onSelect: (projectId: string) => void;
  onCancel: () => void;
}

const ProjectListSelector: React.FC<ProjectListSelectorProps> = observer(
  ({ repositoryId, onSelect, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
      loadProjects();
    }, []);

    const loadProjects = async () => {
      setLoading(true);
      try {
        // If projects are not already loaded
        if (projectStore.projects.length === 0) {
          await projectStore.fetchProjects();
        }

        setProjects(projectStore.projects);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    const handleSelectProject = (projectId: string) => {
      onSelect(projectId);
    };

    return (
      <div className={styles.projectSelector}>
        {loading && <div className={styles.loading}>Loading projects...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <>
            {projects.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No projects found. Create a project first.</p>
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.projectList}>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={styles.projectItem}
                      onClick={() => handleSelectProject(project.id)}
                    >
                      <div className={styles.projectInfo}>
                        <h4>{project.name}</h4>
                        {project.description && <p>{project.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }
);

export default ProjectListSelector;

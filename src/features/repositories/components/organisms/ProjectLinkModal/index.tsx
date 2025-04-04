import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Modal } from "@/common/components/ui";
import { Project } from "@/features/projects/types";

import styles from "./project-link-modal.module.scss";

interface ProjectLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  isLoading: boolean;
  onLinkToProject: (projectId: string) => Promise<void>;
}

const ProjectLinkModal: React.FC<ProjectLinkModalProps> = ({
  isOpen,
  onClose,
  projects,
  isLoading,
  onLinkToProject,
}) => {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  // Set default selection when modal opens
  useEffect(() => {
    if (isOpen && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [isOpen, projects]);

  const handleLinkToProject = async () => {
    if (!selectedProjectId) return;

    setIsLinking(true);
    try {
      await onLinkToProject(selectedProjectId);
      onClose();
      setSelectedProjectId("");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link to Project">
      <div className={styles.linkProjectForm}>
        <p>Select a project to link this repository to:</p>

        {isLoading ? (
          <div className={styles.loading}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className={styles.noProjects}>
            <p>No projects found. Create a project first.</p>
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                navigate("/projects");
              }}
            >
              Go to Projects
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.projectList}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`${styles.projectOption} ${
                    selectedProjectId === project.id ? styles.selectedProject : ""
                  }`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <strong>{project.name}</strong>
                  <span>{project.id.substring(0, 8)}...</span>
                </div>
              ))}
            </div>

            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleLinkToProject}
                disabled={isLinking || !selectedProjectId}
              >
                {isLinking ? "Linking..." : "Link to Project"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ProjectLinkModal;

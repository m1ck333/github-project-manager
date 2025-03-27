import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Project, Issue } from "../../../types";
import { projectStore } from "../../../store";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import IssueForm from "../IssueForm";
import LabelForm from "../LabelForm";
import { useToast } from "../../ui/Toast";
import { FiPlus, FiTag, FiFileText } from "react-icons/fi";
import styles from "./ProjectBoard.module.scss";

interface ProjectBoardProps {
  project: Project;
}

interface IssueWithStatus extends Issue {
  statusName?: string;
}

const ProjectBoard: React.FC<ProjectBoardProps> = observer(({ project }) => {
  const [issues, setIssues] = useState<IssueWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch issues when component mounts
  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      try {
        // Note: We'd need to implement a method to fetch issues
        // This is placeholder code
        // const fetchedIssues = await projectStore.getIssues(project.id);
        // setIssues(fetchedIssues);

        // For now, using mock data
        setTimeout(() => {
          const mockIssues: IssueWithStatus[] = [
            {
              id: "issue1",
              title: "Implement user authentication",
              body: "Add login and registration functionality",
              statusId: "todo-status",
              statusName: "To Do",
              labels: [{ id: "label1", name: "feature", color: "0366d6", description: "" }],
            },
            {
              id: "issue2",
              title: "Fix navigation bug",
              body: "Menu disappears on mobile view",
              statusId: "in-progress-status",
              statusName: "In Progress",
              labels: [{ id: "label2", name: "bug", color: "d73a4a", description: "" }],
            },
            {
              id: "issue3",
              title: "Improve loading performance",
              body: "Optimize image loading",
              statusId: "done-status",
              statusName: "Done",
              labels: [{ id: "label3", name: "enhancement", color: "a2eeef", description: "" }],
            },
          ];
          setIssues(mockIssues);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError((err as Error).message || "Failed to load issues");
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [project.id]);

  const handleIssueMove = async (issueId: string, newStatusId: string) => {
    try {
      // Call the API to update the issue status
      await projectStore.updateIssueStatus(project.id, issueId, newStatusId);

      // Update the local state
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                statusId: newStatusId,
                statusName: project.columns?.find((column) => column.id === newStatusId)?.name,
              }
            : issue
        )
      );
    } catch (err) {
      showToast(`Failed to move issue: ${(err as Error).message}`, "error");
    }
  };

  const renderIssueCard = (issue: IssueWithStatus) => (
    <div key={issue.id} className={styles.issueCard}>
      <h4 className={styles.issueTitle}>{issue.title}</h4>
      {issue.body && <p className={styles.issueBody}>{issue.body}</p>}

      {issue.labels && issue.labels.length > 0 && (
        <div className={styles.issueLabels}>
          {issue.labels.map((label) => (
            <span
              key={label.id}
              className={styles.issueLabel}
              style={{ backgroundColor: `#${label.color}` }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className={styles.issueActions}>
        <select
          value={issue.statusId}
          onChange={(e) => handleIssueMove(issue.id, e.target.value)}
          className={styles.statusSelect}
        >
          {project.columns?.map((column) => (
            <option key={column.id} value={column.id}>
              {column.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.projectBoard}>
      <div className={styles.boardHeader}>
        <h2>{project.name} Board</h2>
        <div className={styles.boardActions}>
          <Button variant="secondary" onClick={() => setShowLabelForm(true)}>
            <FiTag /> Create Label
          </Button>
          <Button variant="primary" onClick={() => setShowIssueForm(true)}>
            <FiPlus /> New Issue
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading issues...</div>
      ) : (
        <div className={styles.boardColumns}>
          {project.columns && project.columns.length > 0 ? (
            project.columns.map((column) => (
              <div key={column.id} className={styles.boardColumn}>
                <div className={styles.columnHeader}>
                  <h3>{column.name}</h3>
                  <span className={styles.issueCount}>
                    {issues.filter((issue) => issue.statusId === column.id).length}
                  </span>
                </div>
                <div className={styles.columnContent}>
                  {issues.filter((issue) => issue.statusId === column.id).map(renderIssueCard)}
                  {issues.filter((issue) => issue.statusId === column.id).length === 0 && (
                    <div className={styles.emptyColumn}>
                      <FiFileText size={24} />
                      <p>No issues</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noBoardsMessage}>
              <p>
                This project doesn't have any columns yet. Create columns to organize your work.
              </p>
              <Button
                variant="primary"
                onClick={() =>
                  showToast("Use the 'Add Column' button in the project details", "info")
                }
              >
                Learn how to add columns
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Issue Creation Modal */}
      <Modal
        isOpen={showIssueForm}
        onClose={() => setShowIssueForm(false)}
        title="Create New Issue"
      >
        <IssueForm
          projectId={project.id}
          onSuccess={() => {
            setShowIssueForm(false);
            // In a real app, we would refresh the issues here
          }}
          onCancel={() => setShowIssueForm(false)}
        />
      </Modal>

      {/* Label Creation Modal */}
      <Modal
        isOpen={showLabelForm}
        onClose={() => setShowLabelForm(false)}
        title="Create New Label"
      >
        <LabelForm
          projectId={project.id}
          onSuccess={() => {
            setShowLabelForm(false);
            // In a real app, we would refresh the labels here
          }}
          onCancel={() => setShowLabelForm(false)}
        />
      </Modal>
    </div>
  );
});

export default ProjectBoard;

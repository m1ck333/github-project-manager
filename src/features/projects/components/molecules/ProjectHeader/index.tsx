import React from "react";
import { FiEdit2, FiRefreshCw } from "react-icons/fi";

import { Button } from "@/common/components/ui";
import { Stack } from "@/common/components/ui/display/Stack";
import { ProjectAction, ProjectTitle } from "@/features/projects/components/atoms";

import styles from "./project-header.module.scss";

interface ProjectHeaderProps {
  title: string;
  onRefresh: () => void;
  onCreateIssue: () => void;
  isRefreshing: boolean;
  subtitle?: string;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  onCreateIssue,
  isRefreshing,
}) => {
  return (
    <Stack direction="row" align="spread" cross="center" className={styles.header}>
      <Stack direction="row" align="center" spacing={2} className={styles.headerTitle}>
        <ProjectTitle title={title || ""} subtitle={subtitle} />
        <ProjectAction
          icon={<FiRefreshCw size={20} />}
          label="Refresh project data"
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="primary"
        />
      </Stack>
      <Stack direction="row" spacing={1} className={styles.headerActions}>
        <Button variant="primary" onClick={onCreateIssue}>
          <FiEdit2 size={16} /> Create Issue
        </Button>
      </Stack>
    </Stack>
  );
};

export default ProjectHeader;

import React from "react";

import { Stack } from "@/common/components/ui/display/Stack";
import Typography from "@/common/components/ui/display/Typography";

import styles from "./project-empty-state.module.scss";

interface ProjectEmptyStateProps {
  title: string;
  description: string;
}

const ProjectEmptyState: React.FC<ProjectEmptyStateProps> = ({ title, description }) => {
  return (
    <Stack
      direction="column"
      align="center"
      cross="center"
      spacing={2}
      className={styles.emptyState}
    >
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1">{description}</Typography>
    </Stack>
  );
};

export default ProjectEmptyState;

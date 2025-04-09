import React from "react";

import { Stack } from "@/common/components/ui/display/Stack";
import Typography from "@/common/components/ui/display/Typography";

import styles from "./project-title.module.scss";

interface ProjectTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Atomic component for displaying project titles with consistent styling
 */
const ProjectTitle: React.FC<ProjectTitleProps> = ({ title, subtitle, className }) => {
  return (
    <Stack direction="column" spacing={0.5} className={`${styles.projectTitle} ${className || ""}`}>
      <Typography variant="h2" className={styles.title}>
        {title || "Untitled Project"}
      </Typography>
      {subtitle && (
        <Typography variant="subtitle1" className={styles.subtitle}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
};

export default ProjectTitle;

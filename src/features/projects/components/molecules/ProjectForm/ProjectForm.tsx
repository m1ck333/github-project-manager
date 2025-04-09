import React, { useState } from "react";

import { FormGroup, Input } from "@/common/components/ui";
import Form from "@/common/components/ui/form/Form";
import { Project, ProjectFormData } from "@/features/projects/types";
import { projectSchema } from "@/features/projects/validation/project.schema";

import styles from "./project-form.module.scss";

export interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<unknown>;
  onCancel: () => void;
  initialValues?: Project | null;
  submitLabel: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  submitLabel,
}) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");

  return (
    <Form
      onSubmit={onSubmit}
      onCancel={onCancel}
      schema={projectSchema}
      className={styles.form}
      actionButtonsProps={{
        submitText: submitLabel,
        submittingText: "Saving...",
      }}
    >
      <FormGroup label="Project Name" htmlFor="project-name">
        <Input
          id="project-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Awesome Project"
          required
        />
      </FormGroup>

      <FormGroup label="Description (optional)" htmlFor="project-description">
        <Input
          id="project-description"
          name="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your project"
        />
      </FormGroup>
    </Form>
  );
};

export default ProjectForm;

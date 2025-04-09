import React from "react";
import { z } from "zod";

import { FormGroup, Input, Modal } from "@/common/components/ui";
import Form from "@/common/components/ui/form/Form";
import { RepositoryFormData as RepoFormData } from "@/features/projects/hooks/use-project-repositories";

import styles from "./link-repository-modal.module.scss";

interface LinkRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RepoFormData) => Promise<unknown>;
  isLoading: boolean;
  error?: string | null;
  owner: string;
  repoName: string;
}

// Validation schema
const repositorySchema = z.object({
  owner: z.string().min(1, "Repository owner is required"),
  repoName: z.string().min(1, "Repository name is required"),
});

// Local type for Form component that satisfies the Record<string, unknown> constraint
type RepositoryFormData = z.infer<typeof repositorySchema>;

const LinkRepositoryModal: React.FC<LinkRepositoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  owner,
  repoName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link GitHub Repository">
      <Form<RepositoryFormData>
        onSubmit={onSubmit as (data: RepositoryFormData) => Promise<unknown>}
        onCancel={onClose}
        schema={repositorySchema}
        error={error}
        actionButtonsProps={{
          submitText: "Link Repository",
          submittingText: "Linking...",
          cancelText: "Cancel",
          submitDisabled: isLoading,
        }}
        className={styles.form}
      >
        <FormGroup label="Repository Owner" htmlFor="owner">
          <Input id="owner" name="owner" placeholder="e.g., facebook" defaultValue={owner} />
        </FormGroup>

        <FormGroup label="Repository Name" htmlFor="repoName">
          <Input id="repoName" name="repoName" placeholder="e.g., react" defaultValue={repoName} />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default LinkRepositoryModal;

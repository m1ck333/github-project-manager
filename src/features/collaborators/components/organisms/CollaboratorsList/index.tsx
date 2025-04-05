import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";

import { Button, Loading } from "@/common/components/ui";
import { Typography } from "@/common/components/ui/typography";
import { RepositoryCollaborator } from "@/features/projects/types";

import AddCollaboratorForm from "../../molecules/AddCollaboratorForm";
import CollaboratorCard from "../../molecules/CollaboratorCard";
import EmptyCollaboratorsList from "../EmptyCollaboratorsList";

import styles from "./collaborators-list.module.scss";

interface CollaboratorsListProps {
  collaborators: RepositoryCollaborator[];
  isLoading: boolean;
  onAddCollaborator: (username: string, permission: string) => Promise<void>;
  onRemoveCollaborator: (collaboratorId: string) => Promise<void>;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  collaborators,
  isLoading,
  onAddCollaborator,
  onRemoveCollaborator,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCollaborator = async (username: string, permission: string) => {
    setIsSubmitting(true);
    try {
      await onAddCollaborator(username, permission);
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.collaboratorsSection}>
      <div className={styles.sectionHeader}>
        <Typography variant="h2">Collaborators</Typography>
        <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? (
            "Cancel"
          ) : (
            <>
              <FiPlus /> Add Collaborator
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <AddCollaboratorForm
          onSubmit={handleAddCollaborator}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {isLoading && (
        <Loading size="medium" text="Loading collaborators..." className={styles.loading} />
      )}

      <div className={styles.collaboratorsList}>
        {collaborators && collaborators.length > 0 ? (
          collaborators.map((collaborator) => (
            <CollaboratorCard
              key={collaborator.id}
              collaborator={collaborator}
              onRemove={onRemoveCollaborator}
            />
          ))
        ) : (
          <EmptyCollaboratorsList entityType="repository" className={styles.emptyCollaborators} />
        )}
      </div>
    </div>
  );
};

export default CollaboratorsList;

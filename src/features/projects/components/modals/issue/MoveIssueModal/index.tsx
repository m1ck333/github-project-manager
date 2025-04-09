import React from "react";

import { Modal } from "@/common/components/ui";
import MoveIssueForm from "@/features/issues/components/molecules/MoveIssueModal";
import { ColumnIssue } from "@/features/issues/types";
import { Column } from "@/features/projects/types";

interface MoveIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue?: ColumnIssue | null;
  onMove: (issue: ColumnIssue, columnId: string) => void;
  isLoading: boolean;
  columns: Column[];
}

export const MoveIssueModal: React.FC<MoveIssueModalProps> = ({
  isOpen,
  onClose,
  issue,
  onMove,
  isLoading,
  columns,
}) => {
  return (
    <Modal title="Move Issue" isOpen={isOpen} onClose={onClose}>
      {issue && (
        <MoveIssueForm
          issue={issue}
          columns={columns}
          onMove={onMove}
          onCancel={onClose}
          isLoading={isLoading}
        />
      )}
    </Modal>
  );
};

export default MoveIssueModal;

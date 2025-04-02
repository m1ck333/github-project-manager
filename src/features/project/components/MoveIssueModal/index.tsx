import React, { useState } from "react";

import Button from "../../../../common/components/ui/Button";
import Modal from "../../../../common/components/ui/Modal";
import { Column } from "../../../../types";

interface MoveIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (columnId: string) => void;
  columns: Column[];
  isLoading: boolean;
  currentColumnId?: string | null;
}

const MoveIssueModal: React.FC<MoveIssueModalProps> = ({
  isOpen,
  onClose,
  onMove,
  columns,
  isLoading,
  currentColumnId,
}) => {
  const [selectedColumnId, setSelectedColumnId] = useState<string>(
    currentColumnId || (columns.length > 0 ? columns[0].id : "")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedColumnId) {
      onMove(selectedColumnId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Move Issue">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="column-select" style={{ display: "block", marginBottom: "0.5rem" }}>
            Select Column
          </label>
          <select
            id="column-select"
            value={selectedColumnId}
            onChange={(e) => setSelectedColumnId(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedColumnId || isLoading}>
            {isLoading ? "Moving..." : "Move Issue"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MoveIssueModal;

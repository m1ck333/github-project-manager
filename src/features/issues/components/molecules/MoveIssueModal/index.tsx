import React, { useState } from "react";

import { Button, Typography } from "@/common/components/ui";

import { Column } from "../../../../projects/types";
import { ColumnIssue } from "../../../types";

interface MoveIssueModalProps {
  issue: ColumnIssue;
  columns: Column[];
  onMove: (issue: ColumnIssue, columnId: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const MoveIssueModal: React.FC<MoveIssueModalProps> = ({
  issue,
  columns,
  onMove,
  onCancel,
  isLoading,
}) => {
  const [selectedColumnId, setSelectedColumnId] = useState<string>(
    issue.columnId || (columns.length > 0 ? columns[0].id : "")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedColumnId) {
      onMove(issue, selectedColumnId);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <div style={{ marginBottom: "1rem" }}>
        <Typography variant="subtitle1" component="div" style={{ marginBottom: "0.5rem" }}>
          {issue.title}
        </Typography>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="column-select" style={{ display: "block", marginBottom: "0.5rem" }}>
          <Typography variant="subtitle2">Select Column</Typography>
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
          disabled={isLoading}
        >
          {columns.map((column) => (
            <option key={column.id} value={column.id}>
              {column.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!selectedColumnId || isLoading || selectedColumnId === issue.columnId}
        >
          {isLoading ? "Moving..." : "Move Issue"}
        </Button>
      </div>
    </form>
  );
};

export default MoveIssueModal;

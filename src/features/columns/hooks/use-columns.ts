import { useState } from "react";

import { useAsync } from "@/common/hooks";
import { Column } from "@/features/projects/types";

export interface UseColumnsProps {
  columns: Column[];
}

export const useColumns = ({ columns }: UseColumnsProps) => {
  const columnAsync = useAsync();

  // UI states
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);

  // Helper to get column by ID
  const getColumnById = (columnId: string): Column | undefined => {
    return columns.find((column) => column.id === columnId);
  };

  // Get the first column (useful for defaults)
  const getFirstColumn = (): Column | undefined => {
    return columns.length > 0 ? columns[0] : undefined;
  };

  // Helper to determine if columns exist
  const hasColumns = (): boolean => {
    return columns.length > 0;
  };

  // Modal handlers
  const handleOpenColumnModal = (column?: Column) => {
    setSelectedColumn(column || null);
    setIsColumnModalOpen(true);
  };

  const handleCloseColumnModal = () => {
    setIsColumnModalOpen(false);
    setSelectedColumn(null);
  };

  return {
    // State
    columns,
    isColumnModalOpen,
    selectedColumn,
    isLoading: columnAsync.isLoading,
    error: columnAsync.error,

    // Getters
    getColumnById,
    getFirstColumn,
    hasColumns,

    // Modal handlers
    handleOpenColumnModal,
    handleCloseColumnModal,
    setIsColumnModalOpen,
  };
};

import { useState } from "react";

import { useAsync } from "./useAsync";

interface ModalOperationOptions<T> {
  /**
   * Initial value for the modal data
   */
  initialData?: T | null;
  /**
   * Function to run when successfully completing the operation
   */
  onSuccess?: (result: unknown) => void;
}

/**
 * Hook that combines modal state management with async operations
 */
export function useModalOperation<T = unknown>(options: ModalOperationOptions<T> = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(options.initialData || null);
  const { isLoading, error, execute, resetError } = useAsync();

  const open = (item?: T | null) => {
    if (item !== undefined) {
      setData(item);
    }
    setIsOpen(true);
  };

  const close = () => {
    if (!isLoading) {
      setIsOpen(false);
      // Reset data when modal closes (not immediately, to avoid UI flickering)
      setTimeout(() => {
        setData(null);
        resetError();
      }, 300);
    }
  };

  const executeWithClose = async <R>(fn: () => Promise<R>): Promise<R | undefined> => {
    const result = await execute(fn);
    if (result !== undefined && options.onSuccess) {
      options.onSuccess(result);
    }
    if (result !== undefined) {
      close();
    }
    return result;
  };

  return {
    isOpen,
    data,
    isLoading,
    error,
    open,
    close,
    execute: executeWithClose,
    resetError,
  };
}

export default useModalOperation;

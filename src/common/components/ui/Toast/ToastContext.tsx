import React, { createContext, useState, useCallback, ReactNode, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

import { ToastType } from "./Toast";
import ToastContainer from "./ToastContainer";

// Define the toast data structure
export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Define the toast context value
export interface ToastContextValue {
  showToast: (message: string, type: ToastType, duration?: number) => string;
  hideToast: (id: string) => void;
  toast: {
    success: (message: string, duration?: number) => string;
    error: (message: string, duration?: number) => string;
    info: (message: string, duration?: number) => string;
    warning: (message: string, duration?: number) => string;
  };
}

// Create the context with default values
export const ToastContext = createContext<ToastContextValue>({
  showToast: () => "placeholder-id",
  hideToast: () => {},
  toast: {
    success: () => "placeholder-id",
    error: () => "placeholder-id",
    info: () => "placeholder-id",
    warning: () => "placeholder-id",
  },
});

// Hook for using toast functionality
export const useToast = () => useContext(ToastContext);

// Provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 5000) => {
    const id = uuidv4();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Helper functions that actually show toasts
  const toast = {
    success: (message: string, duration?: number) => showToast(message, "success", duration),
    error: (message: string, duration?: number) => showToast(message, "error", duration),
    info: (message: string, duration?: number) => showToast(message, "info", duration),
    warning: (message: string, duration?: number) => showToast(message, "warning", duration),
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

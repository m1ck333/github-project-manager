import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import ToastContainer from "./ToastContainer";
import { ToastType } from "./Toast";
import { ToastContextValue, ToastData } from "./types";

// Create the context with a default value
const ToastContext = createContext<ToastContextValue>({
  showToast: () => "",
  hideToast: () => {},
});

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

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

// Hook to use the toast context
export const useToast = () => {
  return useContext(ToastContext);
};

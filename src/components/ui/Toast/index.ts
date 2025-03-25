import { ToastType } from "./Toast";
import ToastContainer from "./ToastContainer";
import { ToastProvider, useToast } from "./ToastContext";
import { ToastContextValue, ToastData } from "./types";

// Helper functions for showing toasts within components
const createToastHelpers = () => {
  return {
    success: (message: string, duration?: number) => {
      // This needs to be called inside a component with the useToast hook
      return message;
    },
    error: (message: string, duration?: number) => {
      return message;
    },
    info: (message: string, duration?: number) => {
      return message;
    },
    warning: (message: string, duration?: number) => {
      return message;
    },
  };
};

export { ToastContainer, ToastProvider, useToast, createToastHelpers as toast };

export type { ToastContextValue, ToastData, ToastType };

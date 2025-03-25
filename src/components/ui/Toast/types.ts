import { ToastType } from "./Toast";

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
}

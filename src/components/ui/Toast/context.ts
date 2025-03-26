import { createContext } from "react";
import { ToastContextValue } from "./types";

// Create the context with a default value
export const ToastContext = createContext<ToastContextValue>({
  showToast: () => "",
  hideToast: () => {},
});

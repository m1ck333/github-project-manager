import { createContext } from "react";

import { ToastContextValue } from "./types";

// Create the context with a default value that won't cause key issues
export const ToastContext = createContext<ToastContextValue>({
  showToast: () => "placeholder-id", // Return a placeholder string instead of empty string
  hideToast: () => {},
});

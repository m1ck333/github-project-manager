import React from "react";
import { Provider } from "urql";
import { client } from "./api/client";
import App from "./App";
import { ToastProvider } from "./components/ui/Toast";

// AppWithProviders component in a separate file for Fast Refresh compatibility
export const AppWithProviders: React.FC = () => (
  <Provider value={client}>
    <ToastProvider>
      <App />
    </ToastProvider>
  </Provider>
);

import React from "react";
import { BrowserRouter } from "react-router-dom";

import { AppInitializer } from "./common/components/layout/AppInitializer";
import Layout from "./common/components/layout/Layout";
import { ToastProvider } from "./common/components/ui/feedback/Toast";
import { AppRoutes } from "./routes";

/**
 * Main Application Component
 * Sets up the application context providers and main layout
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppInitializer>
          <Layout>
            <AppRoutes />
          </Layout>
        </AppInitializer>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

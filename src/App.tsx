import React from "react";
import { BrowserRouter } from "react-router-dom";

import { AppInitializer } from "./components/layout/AppInitializer";
import ErrorBoundaryRoutes from "./components/layout/ErrorBoundaryRoutes";
import Layout from "./components/layout/Layout";
import { ToastProvider } from "./components/ui/Toast";
import { StoreProvider, projectStore, repositoryStore, userStore } from "./store";

const App: React.FC = () => {
  const stores = {
    projectStore,
    repositoryStore,
    userStore,
  };

  return (
    <StoreProvider value={stores}>
      <BrowserRouter>
        <ToastProvider>
          <AppInitializer>
            <Layout>
              <ErrorBoundaryRoutes />
            </Layout>
          </AppInitializer>
        </ToastProvider>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;

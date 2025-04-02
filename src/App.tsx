import React from "react";
import { BrowserRouter } from "react-router-dom";

import { AppInitializer } from "./components/layout/AppInitializer";
import ErrorBoundaryRoutes from "./components/layout/ErrorBoundaryRoutes";
import Layout from "./components/layout/Layout";
import { ToastProvider } from "./components/ui/Toast";
import { StoreProvider, rootStore } from "./store";

const App: React.FC = () => {
  return (
    <StoreProvider value={rootStore}>
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

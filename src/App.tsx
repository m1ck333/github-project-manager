import React from "react";
import { BrowserRouter } from "react-router-dom";

import { AppInitializer } from "./common/components/layout/AppInitializer";
import ErrorBoundaryRoutes from "./common/components/layout/ErrorBoundaryRoutes";
import Layout from "./common/components/layout/Layout";
import { ToastProvider } from "./common/components/ui/Toast";
import { StoreProvider, rootStore } from "./stores";

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

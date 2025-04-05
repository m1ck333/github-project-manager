import React from "react";
import { BrowserRouter } from "react-router-dom";

import { AppInitializer } from "./common/components/layout/AppInitializer";
import ErrorBoundaryRoutes from "./common/components/layout/ErrorBoundaryRoutes";
import Layout from "./common/components/layout/Layout";
import { ToastProvider } from "./common/components/ui/feedback/Toast";
import { StoreContext, rootStore } from "./store";

const App: React.FC = () => {
  return (
    <StoreContext.Provider value={rootStore}>
      <BrowserRouter>
        <ToastProvider>
          <AppInitializer>
            <Layout>
              <ErrorBoundaryRoutes />
            </Layout>
          </AppInitializer>
        </ToastProvider>
      </BrowserRouter>
    </StoreContext.Provider>
  );
};

export default App;

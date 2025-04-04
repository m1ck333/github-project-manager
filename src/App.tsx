import React from "react";
import { BrowserRouter } from "react-router-dom";

import { AppInitializer } from "./common/components/layout/AppInitializer";
import ErrorBoundaryRoutes from "./common/components/layout/ErrorBoundaryRoutes";
import Layout from "./common/components/layout/Layout";
import { ToastProvider } from "./common/components/ui/feedback/Toast";
import { projectStore as Projects } from "./features/projects/stores";
import { repositoryStore as Repositories } from "./features/repositories/stores";

// Create a combined root store
const rootStore = {
  Projects,
  Repositories,
};

// Create a React context for the store
const StoreContext = React.createContext(rootStore);
const StoreProvider = StoreContext.Provider;

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

export { StoreContext, rootStore };
export default App;

import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import Header from "../Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="app-container">
      <Header />
      <main className="main-container" key={`main-${location.pathname}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

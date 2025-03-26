import React, { ReactNode } from "react";
import Header from "../Header";
import { useLocation } from "react-router-dom";

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

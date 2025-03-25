import React, { ReactNode } from "react";
import Header from "../Header";

interface LayoutProps {
  children: ReactNode;
  title: string;
  onCreateClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onCreateClick }) => {
  return (
    <div className="app-container">
      <Header title={title} onCreateClick={onCreateClick} />
      <main className="main-container">{children}</main>
    </div>
  );
};

export default Layout;

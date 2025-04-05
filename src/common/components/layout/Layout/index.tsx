import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import Header from "../Header";

import styles from "./layout.module.scss";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className={styles.appContainer}>
      <Header />
      <main key={`main-${location.pathname}`}>{children}</main>
    </div>
  );
};

export default Layout;

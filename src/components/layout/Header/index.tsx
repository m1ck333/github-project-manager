import React from "react";
import styles from "./Header.module.scss";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      {/* We've moved the create button to the grid layout */}
    </header>
  );
};

export default Header;

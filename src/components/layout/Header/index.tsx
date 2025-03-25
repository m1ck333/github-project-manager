import React from "react";
import Button from "../../ui/Button";
import styles from "./Header.module.scss";

interface HeaderProps {
  title: string;
  onCreateClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onCreateClick }) => {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      <Button variant="primary" onClick={onCreateClick}>
        Create Project
      </Button>
    </header>
  );
};

export default Header;

import React from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.scss";
import { env } from "../../../config/env";

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <img src="/logo-white.svg" alt="Logo" />
          <h1>{env.appName}</h1>
        </Link>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : "")}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" className={({ isActive }) => (isActive ? styles.active : "")}>
              Projects
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, NavLink } from "react-router-dom";

import { Stack } from "@/common/components/ui/display";
import Typography from "@/common/components/ui/display/Typography";
import { env } from "@/common/config/env";
import { useBodyScrollLock, useEscapeKey } from "@/common/hooks";
import { GitHubUserInfo } from "@/features/app";

import styles from "./Header.module.scss";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Use custom hooks for escape key and body scroll locking
  useEscapeKey(() => setMenuOpen(false), menuOpen);
  useBodyScrollLock(menuOpen);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <img src="/logo-white.svg" alt="Logo" />
          <Typography variant="h1" className={styles.appName}>
            {env.appName}
          </Typography>
        </Link>
      </div>

      <div className={styles.headerRight}>
        <Stack direction="row" spacing={2} className={styles.desktopNav} cross="center">
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : "")}>
            Home
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? styles.active : "")}>
            Projects
          </NavLink>
          <NavLink to="/repositories" className={({ isActive }) => (isActive ? styles.active : "")}>
            Repositories
          </NavLink>
        </Stack>

        <div className={styles.userProfile}>
          <GitHubUserInfo />
        </div>

        <button
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}

      <nav className={`${styles.mobileNav} ${menuOpen ? styles.open : ""}`}>
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? styles.active : "")}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/projects"
              className={({ isActive }) => (isActive ? styles.active : "")}
              onClick={() => setMenuOpen(false)}
            >
              Projects
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/repositories"
              className={({ isActive }) => (isActive ? styles.active : "")}
              onClick={() => setMenuOpen(false)}
            >
              Repositories
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

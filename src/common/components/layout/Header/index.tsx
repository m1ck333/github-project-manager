import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, NavLink } from "react-router-dom";

import { env } from "@/common/config/env";
import { GitHubUserInfo } from "@/features/app";

import styles from "./Header.module.scss";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    // Prevent scrolling when menu is open
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <img src="/logo-white.svg" alt="Logo" />
          <h1 className={styles.appName}>{env.appName}</h1>
        </Link>
      </div>

      <nav className={`${styles.desktopNav}`}>
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
          <li>
            <NavLink
              to="/repositories"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              Repositories
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className={styles.headerRight}>
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

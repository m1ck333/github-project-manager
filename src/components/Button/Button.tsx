import React from "react";
import styles from "./Button.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

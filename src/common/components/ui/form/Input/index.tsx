import React, { ReactNode } from "react";

import styles from "./input.module.scss";

export interface CustomInputProps {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix">,
    CustomInputProps {}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  prefix,
  suffix,
  wrapperClassName,
  ...props
}) => {
  return (
    <div className={`${styles.inputWrapper} ${wrapperClassName || ""}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={`${styles.inputContainer} ${error ? styles.hasError : ""}`}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          className={`${styles.input} ${error ? styles.error : ""} ${prefix ? styles.hasPrefix : ""} ${suffix ? styles.hasSuffix : ""} ${className || ""}`}
          {...props}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Input;

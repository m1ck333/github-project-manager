import React, { ReactNode } from "react";

import styles from "./form-group.module.scss";

interface FormGroupProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/**
 * A standardized component for form field groups with label and error handling
 */
const FormGroup: React.FC<FormGroupProps> = ({
  label,
  htmlFor,
  error,
  children,
  className = "",
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default FormGroup;

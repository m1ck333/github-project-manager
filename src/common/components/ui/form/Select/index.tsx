import React from "react";

import styles from "./select.module.scss";

/**
 * Option interface for Select component
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Props for the Select component
 */
export interface SelectProps {
  /** Optional ID for the select element */
  id?: string;
  /** Current value of the select */
  value: string;
  /** Event handler for when selection changes */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Array of options to display in the select */
  options: SelectOption[];
  /** Optional className to apply custom styling */
  className?: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select is required */
  required?: boolean;
}

/**
 * Select component for dropdown selections
 */
const Select: React.FC<SelectProps> = ({
  id,
  value,
  onChange,
  options,
  className,
  placeholder,
  disabled = false,
  required = false,
}) => {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`${styles.select} ${className || ""}`}
      disabled={disabled}
      required={required}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;

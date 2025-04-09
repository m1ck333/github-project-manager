import { ReactNode, FormEvent, useState } from "react";
import { z } from "zod";

import { Stack } from "@/common/components/ui/display/Stack";
import {
  FormActionButtons,
  FormActionButtonsProps,
} from "@/common/components/ui/form/Form/FormActionButtons";
import { useAsync } from "@/common/hooks/use-async";
import { getErrorMessage } from "@/common/utils/errors.utils";

import styles from "./form.module.scss";

export interface FormProps<T = Record<string, unknown>> {
  /**
   * Function to handle form submission
   */
  onSubmit: (data: T) => Promise<unknown>;

  /**
   * Function to call when form is cancelled
   */
  onCancel?: () => void;

  /**
   * Form children (inputs, etc.)
   */
  children: ReactNode;

  /**
   * Initial values for the form
   */
  initialValues?: T;

  /**
   * Function to validate form data before submission
   * Return null if valid, or error message if invalid
   */
  validate?: (data: T) => string | null;

  /**
   * Zod schema for validation (alternative to validate function)
   */
  schema?: z.ZodType<T>;

  /**
   * Function to transform form data before submission
   */
  transformData?: (data: T) => T;

  /**
   * Function to handle successful form submission
   */
  onSuccess?: () => void;

  /**
   * Custom error message to display
   */
  error?: string | null;

  /**
   * Props for form action buttons
   */
  actionButtonsProps?: Omit<FormActionButtonsProps, "isSubmitting" | "onCancel" | "onSubmit">;

  /**
   * Additional class name
   */
  className?: string;

  /**
   * Spacing between form elements
   */
  spacing?: number;

  /**
   * Form ID
   */
  id?: string;
}

/**
 * A reusable form component with standardized layout, error handling, and submission
 */
function Form<T extends Record<string, unknown>>({
  onSubmit,
  onCancel,
  children,
  validate,
  schema,
  transformData,
  onSuccess,
  error: externalError,
  actionButtonsProps,
  className = "",
  spacing = 4,
  id,
}: FormProps<T>) {
  const { isLoading, error: asyncError, execute } = useAsync();
  const [formError, setFormError] = useState<string | null>(null);

  // Combined error from all sources
  const errorMessage = externalError || formError || asyncError;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create form data object from form elements
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries()) as unknown as T;

    // Apply transformation if provided
    const data = transformData ? transformData(formValues) : formValues;

    // Validate with Zod schema if provided
    if (schema) {
      try {
        schema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.errors
            .map((err) => `${err.path.join(".")}: ${err.message}`)
            .join(", ");
          setFormError(errorMessage);
          return;
        }
      }
    }
    // Otherwise use custom validate function if provided
    else if (validate) {
      const validationError = validate(data);
      if (validationError) {
        setFormError(validationError);
        return;
      }
    }

    // Reset form error
    setFormError(null);

    // Submit form
    const result = await execute(async () => {
      try {
        return await onSubmit(data);
      } catch (error) {
        setFormError(getErrorMessage(error));
        throw error;
      }
    });

    // Call onSuccess callback if successful
    if (result !== undefined && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} className={`${styles.form} ${className}`}>
      <Stack direction="column" spacing={spacing}>
        {/* Error message */}
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        {/* Form fields */}
        {children}

        {/* Form actions */}
        <FormActionButtons
          onCancel={onCancel}
          isSubmitting={isLoading}
          submitDisabled={isLoading}
          {...actionButtonsProps}
        />
      </Stack>
    </form>
  );
}

export default Form;

import React, { ReactNode, ElementType, HTMLAttributes } from "react";

import styles from "./Typography.module.scss";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "caption"
  | "overline"
  | "button";

export type ColorVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "disabled"
  | "error"
  | "success"
  | "warning";

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: TypographyVariant;
  component?: ElementType;
  color?: ColorVariant;
  align?: "left" | "center" | "right" | "justify";
  gutterBottom?: boolean;
  noWrap?: boolean;
  className?: string;
}

/**
 * Typography component for consistent text styling
 *
 * @example
 * // Basic usage
 * <Typography variant="h1">Heading 1</Typography>
 * <Typography variant="body1">Regular paragraph text</Typography>
 *
 * // With custom color and alignment
 * <Typography
 *   variant="h2"
 *   color="primary"
 *   align="center"
 *   gutterBottom
 * >
 *   Centered Heading with Bottom Margin
 * </Typography>
 *
 * // Using a different HTML element
 * <Typography variant="h3" component="div">
 *   This is an h3 styled as a div
 * </Typography>
 */
const Typography: React.FC<TypographyProps> = ({
  children,
  variant = "body1",
  component,
  color = "primary",
  align = "left",
  gutterBottom = false,
  noWrap = false,
  className = "",
  ...rest
}) => {
  // Map variant to default HTML tag
  const getDefaultComponent = (): ElementType => {
    switch (variant) {
      case "h1":
        return "h1";
      case "h2":
        return "h2";
      case "h3":
        return "h3";
      case "h4":
        return "h4";
      case "h5":
        return "h5";
      case "h6":
        return "h6";
      case "subtitle1":
      case "subtitle2":
        return "h6";
      case "body1":
      case "body2":
        return "p";
      case "button":
        return "span";
      case "caption":
      case "overline":
        return "span";
      default:
        return "p";
    }
  };

  const Component = component || getDefaultComponent();
  const classNames = `
    ${styles.root}
    ${styles[variant]}
    ${styles[`color-${color}`]}
    ${styles[`align-${align}`]}
    ${gutterBottom ? styles.gutterBottom : ""}
    ${noWrap ? styles.noWrap : ""}
    ${className}
  `.trim();

  return (
    <Component className={classNames} {...rest}>
      {children}
    </Component>
  );
};

export default Typography;

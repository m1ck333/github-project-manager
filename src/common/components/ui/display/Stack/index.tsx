import { CSSProperties, forwardRef, HTMLAttributes, PropsWithChildren } from "react";

import styles from "./stack.module.scss";

export type StackProps = PropsWithChildren<{
  /**
   * Direction of the stack
   */
  direction?: "row" | "column";

  /**
   * Customize the spacing. Value is multiplied by base spacing (8px)
   */
  spacing?: number;

  /**
   * Fills the width to 100%
   */
  fill?: boolean;

  /**
   * Specifies whether the flexible items should wrap or not
   */
  wrap?: boolean;

  /**
   * Align items on the main axis
   */
  align?: "start" | "end" | "center" | "spread" | "stretch";

  /**
   * Align items on the cross axis
   */
  cross?: "start" | "end" | "center" | "stretch";

  /**
   * Additional class names
   */
  className?: string;
}> &
  HTMLAttributes<HTMLDivElement>;

/**
 * Stack component for managing layout with consistent spacing
 * Uses flexbox under the hood with customizable direction, alignment, and spacing
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children,
      spacing = 1,
      direction = "row",
      className = "",
      fill = false,
      wrap = false,
      align,
      cross,
      style,
      ...rest
    },
    ref
  ) => {
    // Combine class names based on props
    const classNames = [
      styles.root,
      styles[direction],
      fill ? styles.fill : "",
      wrap ? styles.wrap : "",
      align ? styles[`align-${align}`] : "",
      cross ? styles[`cross-${cross}`] : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        className={classNames}
        style={
          {
            ...style,
            "--stack-factor": spacing,
          } as CSSProperties
        }
        {...rest}
      >
        {children}
      </div>
    );
  }
);

// Add display name
Stack.displayName = "Stack";

export default Stack;

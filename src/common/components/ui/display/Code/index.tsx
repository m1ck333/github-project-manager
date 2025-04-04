import React, { ReactNode } from "react";

import styles from "./Code.module.scss";

interface CodeProps {
  children: ReactNode;
  inline?: boolean;
  className?: string;
}

/**
 * Code component for displaying code snippets
 *
 * @example
 * // Inline code
 * <Code inline>const x = 5;</Code>
 *
 * // Block code
 * <Code inline={false}>
 *   {`const x = 5;
 *   console.log(x);`}
 * </Code>
 *
 * // Usage with Typography
 * <Typography variant="body1">
 *   Regular text with <Code>inline code</Code> inside.
 * </Typography>
 */
const Code: React.FC<CodeProps> = ({ children, inline = true, className = "" }) => {
  if (inline) {
    return <code className={`${styles.inline} ${className}`}>{children}</code>;
  }

  return (
    <pre className={`${styles.block} ${className}`}>
      <code>{children}</code>
    </pre>
  );
};

export default Code;

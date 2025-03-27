import React, { useState, useRef, useEffect } from "react";
import styles from "./Tooltip.module.scss";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: "top" | "right" | "bottom" | "left";
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 400,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const handleMouseEnter = () => {
    const timeoutId = window.setTimeout(() => {
      setIsVisible(true);
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    }, delay);
    setHoverTimeout(timeoutId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout !== null) {
      window.clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsVisible(false);
  };

  // Click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Clone the child element to add our event handlers
  const childWithProps = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  return (
    <>
      {childWithProps}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${styles[position]} ${className}`}
          style={
            {
              "--x": `${coords.x}px`,
              "--y": `${coords.y}px`,
            } as React.CSSProperties
          }
        >
          {content}
        </div>
      )}
    </>
  );
};

export default Tooltip;

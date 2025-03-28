import React, { useState, useRef, useEffect } from "react";

import styles from "./Tooltip.module.scss";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: "top" | "right" | "bottom" | "left";
  delay?: number;
  className?: string;
  closeOnMouseLeave?: boolean;
  sticky?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 400,
  className = "",
  closeOnMouseLeave = true,
  sticky = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  // Update coordinates when tooltip becomes visible
  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (hoverTimeout !== null) {
      window.clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    const timeoutId = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);

    setHoverTimeout(timeoutId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout !== null) {
      window.clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    if (closeOnMouseLeave && !isHoveringTooltip && !sticky) {
      const timeoutId = window.setTimeout(() => {
        if (!isHoveringTooltip) {
          setIsVisible(false);
        }
      }, 100);

      setHoverTimeout(timeoutId);
    }
  };

  const handleTooltipMouseEnter = () => {
    setIsHoveringTooltip(true);
    if (hoverTimeout !== null) {
      window.clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleTooltipMouseLeave = () => {
    setIsHoveringTooltip(false);
    if (closeOnMouseLeave && !sticky) {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    setIsVisible(!isVisible);
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
        setIsHoveringTooltip(false);
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
    onClick: handleClick,
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
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          {content}
        </div>
      )}
    </>
  );
};

export default Tooltip;

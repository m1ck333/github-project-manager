import { useEffect } from "react";

/**
 * Hook for handling escape key presses.
 * Useful for closing modals, menus, etc.
 *
 * @param callback Function to call when escape key is pressed
 * @param enabled Optional flag to enable/disable the listener
 */
export function useEscapeKey(callback: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callback();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [callback, enabled]);
}

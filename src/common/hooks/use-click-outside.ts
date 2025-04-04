import { useEffect, RefObject } from "react";

/**
 * Hook for detecting clicks outside of a specified element
 * Useful for closing dropdowns, modals, etc. when clicking outside
 *
 * @param ref Reference to the element to detect clicks outside of
 * @param callback Function to call when a click outside is detected
 * @param enabled Whether the listener is enabled
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback, enabled]);
}

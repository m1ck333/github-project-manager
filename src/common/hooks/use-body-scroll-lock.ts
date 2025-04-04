import { useEffect } from "react";

/**
 * Hook for locking body scroll
 * Useful for modals, menus, and other overlays
 *
 * @param isLocked Whether the body scroll should be locked
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    // Get original body overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Apply style based on lock state
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup function to restore original style
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
}

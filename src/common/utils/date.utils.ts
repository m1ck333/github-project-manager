/**
 * Date formatting utilities
 */

/**
 * Format a date string or Date object to a localized string with custom format
 *
 * @param date - Date string or Date object to format
 * @param format - Optional format (defaults to 'dd.MM.yyyy')
 * @param locale - Optional locale (defaults to browser locale)
 * @returns Formatted date string or empty string if date is invalid
 */
export function formatDate(
  date: string | Date | undefined | null,
  format = "dd.MM.yyyy",
  locale?: string
): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "";
    }

    const options: Intl.DateTimeFormatOptions = {};

    // Custom format handling for specific formats
    if (format === "dd.MM.yyyy") {
      // Use browser's Intl API but force the specific separator we want
      return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
        .format(dateObj)
        .replace(/\//g, ".") // Replace any slashes with dots
        .replace(/-/g, "."); // Replace any hyphens with dots as well
    }

    // For other formats, use the flexible implementation
    // Parse the format string to set appropriate options
    if (format.includes("dd")) options.day = "2-digit";
    else if (format.includes("d")) options.day = "numeric";

    if (format.includes("MM")) options.month = "2-digit";
    else if (format.includes("M")) options.month = "numeric";
    else if (format.includes("MMMM")) options.month = "long";
    else if (format.includes("MMM")) options.month = "short";

    if (format.includes("yyyy")) options.year = "numeric";
    else if (format.includes("yy")) options.year = "2-digit";

    if (format.includes("HH") || format.includes("hh")) options.hour = "2-digit";
    else if (format.includes("H") || format.includes("h")) options.hour = "numeric";

    if (format.includes("mm")) options.minute = "2-digit";
    else if (format.includes("m")) options.minute = "numeric";

    if (format.includes("ss")) options.second = "2-digit";
    else if (format.includes("s")) options.second = "numeric";

    // Set 12/24 hour format
    if (format.includes("h")) {
      options.hour12 = true;
    } else if (format.includes("H")) {
      options.hour12 = false;
    }

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Format a date as a relative time string (e.g., "2 days ago", "just now")
 *
 * @param date - Date string or Date object to format
 * @param locale - Optional locale (defaults to browser locale)
 * @returns Relative time string or empty string if date is invalid
 */
export function formatRelativeTime(
  date: string | Date | undefined | null,
  locale?: string
): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "";
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Use Intl.RelativeTimeFormat for localized relative time
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (diffSecs < 60) {
      return diffSecs <= 5 ? "just now" : rtf.format(-diffSecs, "second");
    } else if (diffMins < 60) {
      return rtf.format(-diffMins, "minute");
    } else if (diffHours < 24) {
      return rtf.format(-diffHours, "hour");
    } else if (diffDays < 30) {
      return rtf.format(-diffDays, "day");
    } else if (diffMonths < 12) {
      return rtf.format(-diffMonths, "month");
    } else {
      return rtf.format(-diffYears, "year");
    }
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "";
  }
}

/**
 * Get current date as ISO string
 *
 * @returns Current date in ISO format
 */
export function getCurrentISOString(): string {
  return new Date().toISOString();
}

/**
 * Compare two dates for sorting (ascending order)
 *
 * @param dateA - First date string or Date object
 * @param dateB - Second date string or Date object
 * @returns Negative number if dateA < dateB, positive if dateA > dateB, 0 if equal
 */
export function compareDatesAsc(
  dateA: string | Date | undefined | null,
  dateB: string | Date | undefined | null
): number {
  // Handle undefined or null dates
  if (!dateA && !dateB) return 0;
  if (!dateA) return -1;
  if (!dateB) return 1;

  const timeA = typeof dateA === "string" ? new Date(dateA).getTime() : dateA.getTime();
  const timeB = typeof dateB === "string" ? new Date(dateB).getTime() : dateB.getTime();

  return timeA - timeB;
}

/**
 * Compare two dates for sorting (descending order)
 *
 * @param dateA - First date string or Date object
 * @param dateB - Second date string or Date object
 * @returns Negative number if dateA > dateB, positive if dateA < dateB, 0 if equal
 */
export function compareDatesDesc(
  dateA: string | Date | undefined | null,
  dateB: string | Date | undefined | null
): number {
  return compareDatesAsc(dateB, dateA);
}

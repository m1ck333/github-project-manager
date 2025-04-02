/**
 * Application route definitions
 */

export const ROUTES = {
  HOME: "/",
  PROJECTS: "/projects",
  PROJECT_DETAIL: (id: string = ":id") => `/projects/${id}`,
  PROJECT_BOARD: (id: string = ":id") => `/projects/${id}/board`,
  ISSUES: "/issues",
  SETTINGS: "/settings",
};

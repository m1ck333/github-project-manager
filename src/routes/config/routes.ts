/**
 * Application routes configuration
 * This file defines all routes used in the application
 */

// Define route path constants
export const ROUTE_PATHS = {
  // Main routes
  HOME: "/",
  PROJECTS: "/projects",
  REPOSITORIES: "/repositories",
  ISSUES: "/issues",
  SETTINGS: "/settings",

  // Project routes
  PROJECT_DETAIL: "/projects/:projectId",
  PROJECT_COLUMNS: "/projects/:projectId/columns",
  PROJECT_COLLABORATORS: "/projects/:projectId/collaborators",

  // Repository routes
  REPOSITORY_DETAIL: "/repositories/:owner/:name",
};

// Route generation helpers
export const ROUTES = {
  // Main routes
  HOME: ROUTE_PATHS.HOME,
  PROJECTS: ROUTE_PATHS.PROJECTS,
  REPOSITORIES: ROUTE_PATHS.REPOSITORIES,
  ISSUES: ROUTE_PATHS.ISSUES,
  SETTINGS: ROUTE_PATHS.SETTINGS,

  // Project routes
  PROJECT_DETAIL: (id: string = ":projectId") =>
    ROUTE_PATHS.PROJECT_DETAIL.replace(":projectId", id),

  PROJECT_COLUMNS: (id: string = ":projectId") =>
    ROUTE_PATHS.PROJECT_COLUMNS.replace(":projectId", id),

  PROJECT_COLLABORATORS: (id: string = ":projectId") =>
    ROUTE_PATHS.PROJECT_COLLABORATORS.replace(":projectId", id),

  // Repository routes
  REPOSITORY_DETAIL: (owner: string = ":owner", name: string = ":name") =>
    ROUTE_PATHS.REPOSITORY_DETAIL.replace(":owner", owner).replace(":name", name),
};

// Navigation groups for menus
export const NAV_GROUPS = {
  MAIN: [
    { path: ROUTES.HOME, label: "Home" },
    { path: ROUTES.PROJECTS, label: "Projects" },
    { path: ROUTES.REPOSITORIES, label: "Repositories" },
  ],
  SECONDARY: [
    { path: ROUTES.ISSUES, label: "Issues" },
    { path: ROUTES.SETTINGS, label: "Settings" },
  ],
};

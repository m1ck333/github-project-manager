/**
 * Application route definitions
 */

export const ROUTES = {
  HOME: "/",
  PROJECTS: "/projects",
  PROJECT_DETAIL: (id: string = ":projectId") => `/projects/${id}`,
  PROJECT_BOARD: (id: string = ":projectId") => `/projects/${id}/board`,
  PROJECT_COLLABORATORS: (id: string = ":projectId") => `/projects/${id}/collaborators`,
  REPOSITORIES: "/repositories",
  REPOSITORY_DETAIL: (owner: string = ":owner", name: string = ":name") =>
    `/repositories/${owner}/${name}`,
  ISSUES: "/issues",
  SETTINGS: "/settings",
};

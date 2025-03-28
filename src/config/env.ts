export interface Env {
  appName: string;
  appVersion: string;
  apiUrl: string;
  debug: boolean;
  githubToken: string;
  appEnv: string;
}

export const env: Env = {
  appName: import.meta.env.VITE_APP_NAME || "GitHub Project Manager",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  debug: import.meta.env.VITE_DEBUG === "true",
  githubToken: import.meta.env.VITE_GITHUB_TOKEN,
  appEnv: import.meta.env.VITE_APP_ENV || "development",
};

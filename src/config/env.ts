interface EnvConfig {
  appName: string;
  appVersion: string;
  apiUrl: string;
  githubApiUrl: string;
  debug: boolean;
}

const env: EnvConfig = {
  appName: import.meta.env.VITE_APP_NAME || "GitHub Project Manager",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  githubApiUrl: import.meta.env.VITE_GITHUB_API_URL || "https://api.github.com",
  debug: import.meta.env.VITE_DEBUG === "true",
};

export default env;

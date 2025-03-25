import { ProjectStore } from "./ProjectStore";
import { GitHubService } from "../services/github.service";

// Create the stores
const gitHubService = new GitHubService();
export const projectStore = new ProjectStore(gitHubService);

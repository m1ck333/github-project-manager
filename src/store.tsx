import React from "react";

import { projectStore as Projects } from "./features/projects/stores";
import { repositoryStore as Repositories } from "./features/repositories/stores";
import { userStore as User } from "./features/user/stores/user.store";

// Create a combined root store
const rootStore = {
  Projects,
  Repositories,
  User,
};

// Create a React context for the store
const StoreContext = React.createContext(rootStore);

export { StoreContext, rootStore };

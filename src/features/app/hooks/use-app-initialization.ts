import { useCallback, useEffect, useRef } from "react";

import { projectStore } from "@/features/projects";
import { userStore } from "@/features/user/stores";

export const useAppInitialization = () => {
  const initializedRef = useRef(false);

  const initializeApp = useCallback(async (forceRefresh = false) => {
    if (!userStore.profile && !userStore.isLoading) {
      await userStore.initialize();
    }

    const success = await projectStore.fetchProjects(forceRefresh);
    if (success) {
      initializedRef.current = true;
    }
    return success;
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializeApp(false);
    }
  }, [initializeApp]);

  return {
    loading: projectStore.isLoading || userStore.isLoading,
    error: projectStore.error || userStore.error,
    initializeApp,
  };
};

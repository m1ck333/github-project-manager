import { useCallback } from "react";

import { userService } from "../services";
import { userStore } from "../stores";

/**
 * Hook to get and manage the user's profile using MobX store
 *
 * Note: Components using this hook should be wrapped with observer() for reactivity
 */
export const useUserProfile = () => {
  /**
   * Refresh the user profile
   */
  const refresh = useCallback(async () => {
    return await userService.fetchBasicProfile();
  }, []);

  return {
    profile: userStore.profile,
    loading: userStore.isLoading,
    error: userStore.error,
    refresh,
  };
};

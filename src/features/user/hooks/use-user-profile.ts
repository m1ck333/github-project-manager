import { useEffect, useState } from "react";

import { UserProfile } from "@/features/user/types";

import { userService } from "../services";

/**
 * Hook to get and manage the user's profile
 */
export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await userService.getUserProfile();
        setProfile(userProfile);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /**
   * Refresh the user profile
   */
  const refresh = async () => {
    try {
      setLoading(true);
      const userProfile = await userService.fetchBasicProfile();
      setProfile(userProfile);
      setError(null);
      return userProfile;
    } catch (err) {
      setError(err as Error);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refresh,
  };
};

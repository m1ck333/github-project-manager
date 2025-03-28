import { useState, useEffect } from "react";

import {
  userService,
  type TokenValidationResult,
  type GitHubUserProfile,
} from "@/graphql/services";

interface UseGitHubUserResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasToken: boolean;
  errorMessage: string | null;
  user?: GitHubUserProfile;
  validateUser: () => Promise<TokenValidationResult>;
}

/**
 * Hook to access GitHub user data and authentication status
 */
export function useGitHubUser(): UseGitHubUserResult {
  const [isLoading, setIsLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<TokenValidationResult>({
    isValid: false,
    hasToken: false,
    errorMessage: null,
  });

  // Function to validate user that can be called manually
  const validateUser = async (): Promise<TokenValidationResult> => {
    setIsLoading(true);
    try {
      const result = await userService.validateToken(true); // Force refresh
      setValidationResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial validation on mount
  useEffect(() => {
    const initialValidation = async () => {
      setIsLoading(true);
      try {
        const result = await userService.validateToken();
        setValidationResult(result);
      } finally {
        setIsLoading(false);
      }
    };

    initialValidation();
  }, []);

  return {
    isLoading,
    isAuthenticated: validationResult.isValid,
    hasToken: validationResult.hasToken,
    errorMessage: validationResult.errorMessage,
    user: validationResult.user,
    validateUser,
  };
}

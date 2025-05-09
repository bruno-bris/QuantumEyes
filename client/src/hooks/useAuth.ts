import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

// Type représentant les données utilisateur retournées par l'API
interface AuthUser extends User {
  // Champs supplémentaires potentiellement nécessaires
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
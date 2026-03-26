// hooks/useAuthMe.ts
import { authService } from "@/services/auth.service";
import { User } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";

export function useAuthMe() {
  return useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      // Check token sebelum fetch
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      
      return authService.getCurrentUser();
    },
    retry: false, // Jangan retry kalau 401
    staleTime: 5 * 60 * 1000, // 5 menit
    gcTime: 10 * 60 * 1000, // 10 menit (dulu cacheTime)
    refetchOnWindowFocus: false, // Jangan auto refetch saat window focus
    refetchOnMount: false, // Jangan auto refetch saat mount ulang
  });
}
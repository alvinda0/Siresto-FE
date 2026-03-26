import { useEffect, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useAuthMe } from "@/hooks/useAuthMe";

// HOC untuk proteksi role
export function withRoleProtection<P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: string[]
) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const { data: user, isLoading } = useAuthMe();

    useEffect(() => {
      if (isLoading) return;

      if (!user) {
        router.push("/dashboard");
        return;
      }

      // Menggunakan RoleName string dari user
      const hasPermission = allowedRoles.includes(user.role_name);

      if (!hasPermission) {
        router.push("/dashboard");
        return;
      }
    }, [isLoading, user, router]);

    // Loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      );
    }

    // Check access
    const hasPermission = user ? allowedRoles.includes(user.role_name) : false;

    if (!user || !hasPermission) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Hook untuk permission check
export function usePermission(requiredRole: string | string[]): boolean {
  const { data: user } = useAuthMe();

  if (!user) return false;

  // Handle single role atau multiple roles
  return Array.isArray(requiredRole)
    ? requiredRole.includes(user.role_name)
    : user.role_name === requiredRole;
}
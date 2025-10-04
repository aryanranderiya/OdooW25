"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES } from "@/lib/constants";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

const ROLE_HIERARCHY = {
  ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }

    if (
      !isLoading &&
      isAuthenticated &&
      requiredRole &&
      user &&
      ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[requiredRole]
    ) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [isLoading, isAuthenticated, requiredRole, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (
    requiredRole &&
    user &&
    ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[requiredRole]
  ) {
    return null;
  }

  return <>{children}</>;
}

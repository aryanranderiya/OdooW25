"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "@/lib/auth-api";
import type { User, Company, SignupData, LoginData } from "@/types/user";

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  redirectIfAuthenticated: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (
      !isLoading &&
      user &&
      (pathname === "/login" || pathname === "/signup")
    ) {
      router.push("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  const checkAuth = async () => {
    try {
      const data = await authApi.getCurrentUser();
      if (data) {
        setUser(data.user);
        setCompany(data.company);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    const response = await authApi.login(data);
    setUser(response.user);
    setCompany(response.company);
    router.push("/dashboard");
  };

  const signup = async (data: SignupData) => {
    const response = await authApi.signup(data);
    setUser(response.user);
    setCompany(response.company);
    router.push("/dashboard");
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setCompany(null);
    router.push("/login");
  };

  const redirectIfAuthenticated = () => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        redirectIfAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

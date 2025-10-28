import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  login as loginApi,
  getCurrentUser as getCurrentUserApi,
  logout as logoutApi,
  register as registerApi,
} from "@/features/auth/api";
import type { LoginPayload, RegisterPayload } from "@/features/auth/types";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const AUTH_KEYS = {
  currentUser: ["auth", "current-user"] as const,
};

export function useAuth() {
  const cachedUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isLoading, isError } = useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: getCurrentUserApi,
    retry: 0,
    // If we have cached user, don't block UI: return immediately and refresh in background
    staleTime: 60_000,
    enabled: Boolean(cachedUser),
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  useEffect(() => {
    if (isError) {
      // If /me failed (e.g., expired/invalid), clear cached auth
      setUser(null);
    }
  }, [isError, setUser]);

  return {
    user: data ?? cachedUser ?? null,
    isLoading: !cachedUser ? false : isLoading,
    isError,
  };
}

export function useLogin() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: AUTH_KEYS.currentUser });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerApi(payload),
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: AUTH_KEYS.currentUser });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      setUser(null);

      // Clear all React Query cache
      qc.clear();

      // Clear all localStorage except theme
      const themeValue = localStorage.getItem("theme");
      localStorage.clear();
      if (themeValue) {
        localStorage.setItem("theme", themeValue);
      }
    },
  });
}

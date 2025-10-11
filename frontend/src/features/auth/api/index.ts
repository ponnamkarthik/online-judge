import { api } from "@/lib/api-client";
import type {
  LoginPayload,
  RegisterPayload,
  User,
} from "@/features/auth/types";

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<{ user: User }>(
    "/api/auth/register",
    payload
  );
  return data.user;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<{ user: User }>("/api/auth/login", payload);
  return data.user;
}

export async function me() {
  const { data } = await api.get<{ user: User }>("/api/auth/me");
  return data.user;
}

export async function refresh() {
  const { data } = await api.post<{ ok: boolean }>("/api/auth/refresh");
  return data.ok;
}

export async function logout() {
  const { data } = await api.post<{ ok: boolean }>("/api/auth/logout");
  return data.ok;
}

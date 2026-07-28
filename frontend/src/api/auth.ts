import type { LoginPayload, RegisterPayload, TokenResponse, User } from "../types/auth";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  register: (data: RegisterPayload) =>
    request<User>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: LoginPayload) =>
    request<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  refresh: (refresh_token: string) =>
    request<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  logout: (refresh_token: string) =>
    request<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  me: (access_token: string) =>
    request<User>("/auth/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    }),
};
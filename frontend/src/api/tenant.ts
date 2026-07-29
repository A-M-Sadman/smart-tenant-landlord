import type { TenantProfile, TenantProfileUpdate } from "../types/tenant";

const BASE_URL = '/api/v1';

function getToken() {
  return localStorage.getItem("access_token") ?? "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

export const tenantApi = {
  getProfile: () => request<TenantProfile>("/tenant/profile"),
  updateProfile: (data: TenantProfileUpdate) =>
    request<TenantProfile>("/tenant/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
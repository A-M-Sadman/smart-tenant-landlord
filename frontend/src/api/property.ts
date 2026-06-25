import type { Property, PropertyCreate, PropertyUpdate, Unit, UnitCreate, UnitUpdate } from "../types/property";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

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
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const propertyApi = {
  list: () => request<Property[]>("/properties"),
  get: (id: string) => request<Property>(`/properties/${id}`),
  create: (data: PropertyCreate) =>
    request<Property>("/properties", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: PropertyUpdate) =>
    request<Property>(`/properties/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/properties/${id}`, { method: "DELETE" }),

  listUnits: (propertyId: string) =>
    request<Unit[]>(`/properties/${propertyId}/units`),
  getUnit: (propertyId: string, unitId: string) =>
    request<Unit>(`/properties/${propertyId}/units/${unitId}`),
  createUnit: (propertyId: string, data: UnitCreate) =>
    request<Unit>(`/properties/${propertyId}/units`, { method: "POST", body: JSON.stringify(data) }),
  updateUnit: (propertyId: string, unitId: string, data: UnitUpdate) =>
    request<Unit>(`/properties/${propertyId}/units/${unitId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUnit: (propertyId: string, unitId: string) =>
    request<void>(`/properties/${propertyId}/units/${unitId}`, { method: "DELETE" }),
};
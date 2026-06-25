export interface Property {
  id: string;
  landlord_id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  total_units: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyCreate {
  name: string;
  address: string;
  city: string;
  district: string;
  description?: string;
}

export interface PropertyUpdate {
  name?: string;
  address?: string;
  city?: string;
  district?: string;
  description?: string;
}

export type UnitStatus = "vacant" | "occupied" | "maintenance";

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  floor?: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  rent_amount: number;
  status: UnitStatus;
  created_at: string;
  updated_at: string;
}

export interface UnitCreate {
  unit_number: string;
  floor?: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  rent_amount: number;
}

export interface UnitUpdate {
  unit_number?: string;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  rent_amount?: number;
  status?: UnitStatus;
}
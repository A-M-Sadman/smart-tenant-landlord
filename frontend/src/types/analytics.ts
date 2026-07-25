export interface MonthlyRevenue {
  month: string;
  collected: number;
  pending: number;
}

export interface MonthlyPaymentTrend {
  month: string;
  paid: number;
  pending: number;
  overdue: number;
}

export interface MonthlyMaintenanceTrend {
  month: string;
  open: number;
  resolved: number;
}

export interface OccupancyRate {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_rate: number;
}

export interface ComplaintByCategory {
  category: string;
  count: number;
}

export interface Analytics {
  revenue: MonthlyRevenue[];
  payment_trends: MonthlyPaymentTrend[];
  maintenance_trends: MonthlyMaintenanceTrend[];
  occupancy: OccupancyRate;
  complaint_categories: ComplaintByCategory[];
}
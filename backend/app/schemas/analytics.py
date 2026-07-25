from typing import List
from pydantic import BaseModel


class MonthlyRevenue(BaseModel):
    month: str  # e.g. "2026-01"
    collected: float
    pending: float


class MonthlyPaymentTrend(BaseModel):
    month: str
    paid: int
    pending: int
    overdue: int


class MonthlyMaintenanceTrend(BaseModel):
    month: str
    open: int
    resolved: int


class OccupancyRate(BaseModel):
    total_units: int
    occupied_units: int
    vacant_units: int
    occupancy_rate: float  # percentage


class ComplaintByCategory(BaseModel):
    category: str
    count: int


class AnalyticsResponse(BaseModel):
    revenue: List[MonthlyRevenue]
    payment_trends: List[MonthlyPaymentTrend]
    maintenance_trends: List[MonthlyMaintenanceTrend]
    occupancy: OccupancyRate
    complaint_categories: List[ComplaintByCategory]
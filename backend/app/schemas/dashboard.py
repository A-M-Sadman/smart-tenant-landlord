import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator
from app.models.user import UserRole


# ── Landlord Dashboard ────────────────────────────────────────────────────────

class LandlordStats(BaseModel):
    total_properties: int
    total_units: int
    total_tenants: int
    open_maintenance_requests: int
    pending_payments: int
    overdue_payments: int
    open_complaints: int
    open_assignments: int
    open_agreements: int


class RecentActivity(BaseModel):
    type: str
    description: str
    timestamp: datetime


class LandlordDashboardResponse(BaseModel):
    stats: LandlordStats
    recent_activity: List[RecentActivity] = []


# ── Admin ─────────────────────────────────────────────────────────────────────

class AdminUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    @field_validator("id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class AdminPropertyResponse(BaseModel):
    id: uuid.UUID
    name: str
    address: str
    city: str
    district: str
    total_units: int
    landlord_id: uuid.UUID
    landlord_email: Optional[str] = None
    landlord_name: Optional[str] = None
    created_at: Optional[datetime] = None

    @field_validator("id", "landlord_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class PlatformStats(BaseModel):
    total_users: int
    total_landlords: int
    total_tenants: int
    total_maintenance_staff: int
    total_admins: int
    total_properties: int
    total_units: int
    total_active_assignments: int
    total_active_agreements: int
    total_open_complaints: int
    total_open_maintenance: int
    total_pending_payments: int
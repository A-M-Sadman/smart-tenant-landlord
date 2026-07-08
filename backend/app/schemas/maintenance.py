
import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator
from app.models.maintenance import (
    MaintenanceCategory,
    RequestPriority,
    RequestStatus,
    StaffWorkStatus,
)


# ── Shared user info ──────────────────────────────────────────────────────────

class UserInfo(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str] = None

    @field_validator("id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


# ── Maintenance Assignment schemas ────────────────────────────────────────────

class MaintenanceAssignmentCreate(BaseModel):
    staff_id: uuid.UUID
    notes: Optional[str] = None


class MaintenanceAssignmentUpdate(BaseModel):
    status: Optional[StaffWorkStatus] = None
    notes: Optional[str] = None


class MaintenanceAssignmentResponse(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID
    staff_id: uuid.UUID
    assigned_by: uuid.UUID
    notes: Optional[str] = None
    status: StaffWorkStatus
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    staff: Optional[UserInfo] = None
    assigner: Optional[UserInfo] = None

    @field_validator("id", "request_id", "staff_id", "assigned_by", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


# ── Maintenance Request schemas ───────────────────────────────────────────────

class MaintenanceRequestCreate(BaseModel):
    unit_id: uuid.UUID
    category: MaintenanceCategory
    title: str
    description: str
    priority: Optional[RequestPriority] = RequestPriority.medium
    attachment_url: Optional[str] = None


class MaintenanceRequestUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    priority: Optional[RequestPriority] = None
    title: Optional[str] = None
    description: Optional[str] = None


class MaintenanceRequestResponse(BaseModel):
    id: uuid.UUID
    unit_id: uuid.UUID
    tenant_id: uuid.UUID
    category: MaintenanceCategory
    title: str
    description: str
    priority: RequestPriority
    status: RequestStatus
    attachment_url: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tenant: Optional[UserInfo] = None
    assignments: List[MaintenanceAssignmentResponse] = []

    @field_validator("id", "unit_id", "tenant_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


# ── Staff assignment view (includes full request) ─────────────────────────────

class StaffAssignmentResponse(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID
    staff_id: uuid.UUID
    assigned_by: uuid.UUID
    notes: Optional[str] = None
    status: StaffWorkStatus
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    request: Optional[MaintenanceRequestResponse] = None

    @field_validator("id", "request_id", "staff_id", "assigned_by", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True
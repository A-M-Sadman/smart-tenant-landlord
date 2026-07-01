import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.assignment import AssignmentStatus


class AssignmentCreate(BaseModel):
    unit_id: uuid.UUID
    tenant_id: uuid.UUID
    start_date: date
    end_date: Optional[date] = None


class AssignmentUpdate(BaseModel):
    end_date: Optional[date] = None
    status: Optional[AssignmentStatus] = None


class TenantInfo(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str] = None

    @field_validator("id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class UnitInfo(BaseModel):
    id: uuid.UUID
    unit_number: str
    property_id: uuid.UUID

    @field_validator("id", "property_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class AssignmentResponse(BaseModel):
    id: uuid.UUID
    unit_id: uuid.UUID
    tenant_id: uuid.UUID
    assigned_by: uuid.UUID
    start_date: date
    end_date: Optional[date] = None
    status: AssignmentStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tenant: Optional[TenantInfo] = None
    unit: Optional[UnitInfo] = None

    @field_validator("id", "unit_id", "tenant_id", "assigned_by", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class TenantSearchResult(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str] = None

    @field_validator("id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True
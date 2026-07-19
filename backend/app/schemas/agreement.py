import uuid
from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, field_validator
from app.models.agreement import AgreementStatus



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


class AssignmentInfo(BaseModel):
    id: uuid.UUID
    unit_id: uuid.UUID
    tenant_id: uuid.UUID
    start_date: date
    end_date: Optional[date] = None
    status: str

    @field_validator("id", "unit_id", "tenant_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class AgreementCreate(BaseModel):
    assignment_id: uuid.UUID
    start_date: date
    end_date: date
    monthly_rent: Decimal
    security_deposit: Optional[Decimal] = Decimal("0")
    terms: Optional[str] = None


class AgreementUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    monthly_rent: Optional[Decimal] = None
    security_deposit: Optional[Decimal] = None
    terms: Optional[str] = None


class AgreementResponse(BaseModel):
    id: uuid.UUID
    assignment_id: uuid.UUID
    landlord_id: uuid.UUID
    tenant_id: uuid.UUID
    start_date: date
    end_date: date
    monthly_rent: Decimal
    security_deposit: Decimal
    terms: Optional[str] = None
    status: AgreementStatus
    signed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    landlord: Optional[UserInfo] = None
    tenant: Optional[UserInfo] = None
    assignment: Optional[AssignmentInfo] = None
    tenant_accepted_at: Optional[datetime] = None

    @field_validator("id", "assignment_id", "landlord_id", "tenant_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True
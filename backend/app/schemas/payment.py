import uuid
from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, field_validator
from app.models.payment import PaymentStatus, PaymentMethod


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


class AgreementInfo(BaseModel):
    id: uuid.UUID
    monthly_rent: Decimal
    start_date: date
    end_date: date
    status: str

    @field_validator("id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    agreement_id: uuid.UUID
    amount: Decimal
    due_date: date
    payment_method: PaymentMethod
    paid_date: Optional[date] = None
    status: Optional[PaymentStatus] = PaymentStatus.pending
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None


class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    due_date: Optional[date] = None
    paid_date: Optional[date] = None
    payment_method: Optional[PaymentMethod] = None
    status: Optional[PaymentStatus] = None
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: uuid.UUID
    agreement_id: uuid.UUID
    tenant_id: uuid.UUID
    amount: Decimal
    due_date: date
    paid_date: Optional[date] = None
    payment_method: PaymentMethod
    status: PaymentStatus
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tenant: Optional[UserInfo] = None
    agreement: Optional[AgreementInfo] = None

    @field_validator("id", "agreement_id", "tenant_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True
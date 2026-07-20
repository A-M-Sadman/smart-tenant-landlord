import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator
from app.models.complaint import ComplaintCategory, ComplaintStatus


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


class ComplaintResponseCreate(BaseModel):
    message: str


class ComplaintResponseResponse(BaseModel):
    id: uuid.UUID
    complaint_id: uuid.UUID
    responder_id: uuid.UUID
    message: str
    created_at: Optional[datetime] = None
    responder: Optional[UserInfo] = None

    @field_validator("id", "complaint_id", "responder_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class ComplaintCreate(BaseModel):
    unit_id: uuid.UUID
    category: ComplaintCategory
    subject: str
    description: str


class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None


class ComplaintResponse(BaseModel):
    id: uuid.UUID
    unit_id: uuid.UUID
    tenant_id: uuid.UUID
    category: ComplaintCategory
    subject: str
    description: str
    status: ComplaintStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tenant: Optional[UserInfo] = None
    responses: List[ComplaintResponseResponse] = []

    @field_validator("id", "unit_id", "tenant_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True
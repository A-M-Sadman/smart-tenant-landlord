from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class TenantProfileUpdate(BaseModel):
    nid: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    occupation: Optional[str] = None
    profile_photo_url: Optional[str] = None


class TenantProfileResponse(BaseModel):
    id: str
    user_id: str
    nid: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    occupation: Optional[str] = None
    profile_photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("id", "user_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v)

    class Config:
        from_attributes = True


class TenantProfileWithUser(TenantProfileResponse):
    email: str
    full_name: str
    phone: Optional[str] = None
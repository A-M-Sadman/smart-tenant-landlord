from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime


class PropertyCreate(BaseModel):
    name: str
    address: str
    city: str
    district: str
    description: Optional[str] = None


class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class PropertyResponse(BaseModel):
    id: str
    landlord_id: str
    name: str
    address: str
    city: str
    district: str
    total_units: int
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("id", "landlord_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v)

    class Config:
        from_attributes = True
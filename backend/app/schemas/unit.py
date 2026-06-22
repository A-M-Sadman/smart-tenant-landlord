from pydantic import BaseModel, field_validator
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum


class UnitStatus(str, Enum):
    vacant = "vacant"
    occupied = "occupied"
    maintenance = "maintenance"


class UnitCreate(BaseModel):
    unit_number: str
    floor: Optional[int] = None
    bedrooms: int = 1
    bathrooms: int = 1
    area_sqft: Optional[Decimal] = None
    rent_amount: Decimal


class UnitUpdate(BaseModel):
    unit_number: Optional[str] = None
    floor: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqft: Optional[Decimal] = None
    rent_amount: Optional[Decimal] = None
    status: Optional[UnitStatus] = None


class UnitResponse(BaseModel):
    id: str
    property_id: str
    unit_number: str
    floor: Optional[int] = None
    bedrooms: int
    bathrooms: int
    area_sqft: Optional[Decimal] = None
    rent_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    @field_validator("id", "property_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v)

    class Config:
        from_attributes = True
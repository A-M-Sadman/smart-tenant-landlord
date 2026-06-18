import uuid
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UnitStatus(str, enum.Enum):
    vacant = "vacant"
    occupied = "occupied"
    maintenance = "maintenance"


class Unit(Base):
    __tablename__ = "units"
    __table_args__ = (UniqueConstraint("property_id", "unit_number", name="uq_unit_number_per_property"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    unit_number = Column(String(20), nullable=False)
    floor = Column(Integer, nullable=True)
    bedrooms = Column(Integer, nullable=False, default=1)
    bathrooms = Column(Integer, nullable=False, default=1)
    area_sqft = Column(Numeric(8, 2), nullable=True)
    rent_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(UnitStatus), nullable=False, default=UnitStatus.vacant, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    property = relationship("Property", back_populates="units")
    assignments = relationship("TenantAssignment", back_populates="unit", cascade="all, delete-orphan")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="unit", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="unit", cascade="all, delete-orphan")
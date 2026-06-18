import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class MaintenanceCategory(str, enum.Enum):
    plumbing = "plumbing"
    electrical = "electrical"
    hvac = "hvac"
    appliance = "appliance"
    structural = "structural"
    other = "other"


class RequestPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class RequestStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"
    rejected = "rejected"


class StaffWorkStatus(str, enum.Enum):
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    category = Column(Enum(MaintenanceCategory), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Enum(RequestPriority), nullable=False, default=RequestPriority.medium, index=True)
    status = Column(Enum(RequestStatus), nullable=False, default=RequestStatus.open, index=True)
    attachment_url = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    unit = relationship("Unit", back_populates="maintenance_requests")
    tenant = relationship("User", foreign_keys=[tenant_id])
    assignments = relationship("MaintenanceAssignment", back_populates="request", cascade="all, delete-orphan")


class MaintenanceAssignment(Base):
    __tablename__ = "maintenance_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("maintenance_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    staff_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(Enum(StaffWorkStatus), nullable=False, default=StaffWorkStatus.assigned)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    request = relationship("MaintenanceRequest", back_populates="assignments")
    staff = relationship("User", foreign_keys=[staff_id])
    assigner = relationship("User", foreign_keys=[assigned_by])
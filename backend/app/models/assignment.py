import uuid
from sqlalchemy import Column, Date, DateTime, ForeignKey, Enum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class AssignmentStatus(str, enum.Enum):
    active = "active"
    past = "past"
    terminated = "terminated"


class TenantAssignment(Base):
    __tablename__ = "tenant_assignments"
    __table_args__ = (
        Index("ix_one_active_per_unit", "unit_id", unique=True,
              postgresql_where="status = 'active'"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(Enum(AssignmentStatus), nullable=False, default=AssignmentStatus.active, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    unit = relationship("Unit", back_populates="assignments")
    tenant = relationship("User", foreign_keys=[tenant_id])
    assigner = relationship("User", foreign_keys=[assigned_by])
    agreements = relationship("RentalAgreement", back_populates="assignment", cascade="all, delete-orphan")
import uuid
from sqlalchemy import Column, Date, DateTime, ForeignKey, Enum, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class AgreementStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    expired = "expired"
    terminated = "terminated"


class RentalAgreement(Base):
    __tablename__ = "rental_agreements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("tenant_assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    landlord_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    monthly_rent = Column(Numeric(10, 2), nullable=False)
    security_deposit = Column(Numeric(10, 2), nullable=False, default=0)
    terms = Column(Text, nullable=True)
    status = Column(Enum(AgreementStatus), nullable=False, default=AgreementStatus.draft, index=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assignment = relationship("TenantAssignment", back_populates="agreements")
    landlord = relationship("User", foreign_keys=[landlord_id])
    tenant = relationship("User", foreign_keys=[tenant_id])
    payments = relationship("RentPayment", back_populates="agreement", cascade="all, delete-orphan")
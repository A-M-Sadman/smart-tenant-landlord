import uuid
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.complaint import Complaint, ComplaintResponse, ComplaintStatus
from app.models.unit import Unit
from app.models.property import Property
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponseCreate


def _load_complaint(db: Session, complaint_id: uuid.UUID) -> Complaint:
    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .options(
            joinedload(Complaint.tenant),
            joinedload(Complaint.responses).joinedload(ComplaintResponse.responder),
        )
        .first()
    )
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


def _assert_unit_belongs_to_tenant(db: Session, unit_id: uuid.UUID, tenant_id: uuid.UUID):
    from app.models.assignment import TenantAssignment, AssignmentStatus
    assignment = (
        db.query(TenantAssignment)
        .filter(
            TenantAssignment.unit_id == unit_id,
            TenantAssignment.tenant_id == tenant_id,
            TenantAssignment.status == AssignmentStatus.active,
        )
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="You do not have an active assignment on this unit",
        )


def _assert_complaint_belongs_to_landlord(
    db: Session, complaint: Complaint, landlord_id: uuid.UUID
):
    unit = (
        db.query(Unit)
        .join(Property, Unit.property_id == Property.id)
        .filter(Unit.id == complaint.unit_id, Property.landlord_id == landlord_id)
        .first()
    )
    if not unit:
        raise HTTPException(
            status_code=403,
            detail="This complaint does not belong to your properties",
        )


# ── Tenant operations ─────────────────────────────────────────────────────────

def create_complaint(
    db: Session, data: ComplaintCreate, tenant_id: uuid.UUID
) -> Complaint:
    _assert_unit_belongs_to_tenant(db, data.unit_id, tenant_id)

    complaint = Complaint(
        unit_id=data.unit_id,
        tenant_id=tenant_id,
        category=data.category,
        subject=data.subject,
        description=data.description,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return _load_complaint(db, complaint.id)


def get_tenant_complaints(db: Session, tenant_id: uuid.UUID) -> List[Complaint]:
    return (
        db.query(Complaint)
        .filter(Complaint.tenant_id == tenant_id)
        .options(
            joinedload(Complaint.responses).joinedload(ComplaintResponse.responder),
        )
        .order_by(Complaint.created_at.desc())
        .all()
    )


def get_complaint(
    db: Session, complaint_id: uuid.UUID, user_id: uuid.UUID, is_landlord: bool = False
) -> Complaint:
    complaint = _load_complaint(db, complaint_id)
    if is_landlord:
        return complaint
    if str(complaint.tenant_id) != str(user_id):
        raise HTTPException(status_code=403, detail="Not your complaint")
    return complaint


# ── Landlord operations ───────────────────────────────────────────────────────

def get_landlord_complaints(db: Session, landlord_id: uuid.UUID) -> List[Complaint]:
    return (
        db.query(Complaint)
        .join(Unit, Complaint.unit_id == Unit.id)
        .join(Property, Unit.property_id == Property.id)
        .filter(Property.landlord_id == landlord_id)
        .options(
            joinedload(Complaint.tenant),
            joinedload(Complaint.responses).joinedload(ComplaintResponse.responder),
        )
        .order_by(Complaint.created_at.desc())
        .all()
    )


def update_complaint(
    db: Session,
    complaint_id: uuid.UUID,
    data: ComplaintUpdate,
    landlord_id: uuid.UUID,
) -> Complaint:
    complaint = _load_complaint(db, complaint_id)
    _assert_complaint_belongs_to_landlord(db, complaint, landlord_id)

    if data.status is not None:
        complaint.status = data.status

    db.commit()
    db.refresh(complaint)
    return _load_complaint(db, complaint.id)


def add_response(
    db: Session,
    complaint_id: uuid.UUID,
    data: ComplaintResponseCreate,
    responder_id: uuid.UUID,
    landlord_id: uuid.UUID,
) -> Complaint:
    complaint = _load_complaint(db, complaint_id)
    _assert_complaint_belongs_to_landlord(db, complaint, landlord_id)

    response = ComplaintResponse(
        complaint_id=complaint_id,
        responder_id=responder_id,
        message=data.message,
    )
    db.add(response)
    db.commit()
    return _load_complaint(db, complaint_id)


def delete_complaint(
    db: Session, complaint_id: uuid.UUID, tenant_id: uuid.UUID
) -> None:
    complaint = _load_complaint(db, complaint_id)

    if str(complaint.tenant_id) != str(tenant_id):
        raise HTTPException(status_code=403, detail="Not your complaint")

    if complaint.status != ComplaintStatus.open:
        raise HTTPException(
            status_code=400,
            detail="Only open complaints can be deleted",
        )

    db.delete(complaint)
    db.commit()
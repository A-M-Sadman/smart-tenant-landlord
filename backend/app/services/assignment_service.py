import uuid
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.assignment import TenantAssignment, AssignmentStatus
from app.models.unit import Unit
from app.models.property import Property
from app.models.user import User, UserRole
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate


def _get_unit_owned_by_landlord(
    db: Session, unit_id: uuid.UUID, landlord_id: uuid.UUID
) -> Unit:
    unit = (
        db.query(Unit)
        .join(Property, Unit.property_id == Property.id)
        .filter(Unit.id == unit_id, Property.landlord_id == landlord_id)
        .first()
    )
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found or does not belong to you",
        )
    return unit


def _get_assignment_owned_by_landlord(
    db: Session, assignment_id: uuid.UUID, landlord_id: uuid.UUID
) -> TenantAssignment:
    assignment = (
        db.query(TenantAssignment)
        .join(Unit, TenantAssignment.unit_id == Unit.id)
        .join(Property, Unit.property_id == Property.id)
        .filter(
            TenantAssignment.id == assignment_id,
            Property.landlord_id == landlord_id,
        )
        .options(
            joinedload(TenantAssignment.tenant),
            joinedload(TenantAssignment.unit),
        )
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found or does not belong to you",
        )
    return assignment


def create_assignment(
    db: Session, data: AssignmentCreate, landlord_id: uuid.UUID
) -> TenantAssignment:
    # 1. Unit must belong to this landlord
    _get_unit_owned_by_landlord(db, data.unit_id, landlord_id)

    # 2. Unit must not already have an active assignment
    existing_unit = (
        db.query(TenantAssignment)
        .filter(
            TenantAssignment.unit_id == data.unit_id,
            TenantAssignment.status == AssignmentStatus.active,
        )
        .first()
    )
    if existing_unit:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This unit already has an active tenant assignment",
        )

    # 3. Tenant must exist and have role=tenant
    tenant = db.query(User).filter(User.id == data.tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant user not found",
        )
    if tenant.role != UserRole.tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target user is not registered as a tenant",
        )

    # 4. Tenant must not be actively assigned elsewhere
    existing_tenant = (
        db.query(TenantAssignment)
        .filter(
            TenantAssignment.tenant_id == data.tenant_id,
            TenantAssignment.status == AssignmentStatus.active,
        )
        .first()
    )
    if existing_tenant:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This tenant is already actively assigned to another unit",
        )

    assignment = TenantAssignment(
        unit_id=data.unit_id,
        tenant_id=data.tenant_id,
        assigned_by=landlord_id,
        start_date=data.start_date,
        end_date=data.end_date,
        status=AssignmentStatus.active,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return (
        db.query(TenantAssignment)
        .filter(TenantAssignment.id == assignment.id)
        .options(
            joinedload(TenantAssignment.tenant),
            joinedload(TenantAssignment.unit),
        )
        .first()
    )


def get_assignments(
    db: Session, landlord_id: uuid.UUID
) -> List[TenantAssignment]:
    return (
        db.query(TenantAssignment)
        .join(Unit, TenantAssignment.unit_id == Unit.id)
        .join(Property, Unit.property_id == Property.id)
        .filter(Property.landlord_id == landlord_id)
        .options(
            joinedload(TenantAssignment.tenant),
            joinedload(TenantAssignment.unit),
        )
        .order_by(TenantAssignment.created_at.desc())
        .all()
    )


def get_assignment(
    db: Session, assignment_id: uuid.UUID, landlord_id: uuid.UUID
) -> TenantAssignment:
    return _get_assignment_owned_by_landlord(db, assignment_id, landlord_id)


def update_assignment(
    db: Session,
    assignment_id: uuid.UUID,
    data: AssignmentUpdate,
    landlord_id: uuid.UUID,
) -> TenantAssignment:
    assignment = _get_assignment_owned_by_landlord(db, assignment_id, landlord_id)

    if data.end_date is not None:
        assignment.end_date = data.end_date
    if data.status is not None:
        assignment.status = data.status

    db.commit()
    db.refresh(assignment)
    return assignment


def end_assignment(
    db: Session, assignment_id: uuid.UUID, landlord_id: uuid.UUID
) -> TenantAssignment:
    """Convenience: set status=past without full update payload."""
    assignment = _get_assignment_owned_by_landlord(db, assignment_id, landlord_id)
    assignment.status = AssignmentStatus.past
    db.commit()
    db.refresh(assignment)
    return assignment


def delete_assignment(
    db: Session, assignment_id: uuid.UUID, landlord_id: uuid.UUID
) -> None:
    assignment = _get_assignment_owned_by_landlord(db, assignment_id, landlord_id)
    db.delete(assignment)
    db.commit()


def get_unit_active_assignment(
    db: Session, unit_id: uuid.UUID, landlord_id: uuid.UUID
) -> Optional[TenantAssignment]:
    _get_unit_owned_by_landlord(db, unit_id, landlord_id)
    return (
        db.query(TenantAssignment)
        .filter(
            TenantAssignment.unit_id == unit_id,
            TenantAssignment.status == AssignmentStatus.active,
        )
        .options(joinedload(TenantAssignment.tenant))
        .first()
    )


def search_tenants(db: Session, email: str) -> List[User]:
    return (
        db.query(User)
        .filter(
            User.role == UserRole.tenant,
            User.email.ilike(f"%{email}%"),
        )
        .limit(10)
        .all()
    )
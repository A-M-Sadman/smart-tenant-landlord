import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.maintenance import (
    MaintenanceRequest,
    MaintenanceAssignment,
    RequestStatus,
    StaffWorkStatus,
)
from app.models.unit import Unit
from app.models.property import Property
from app.models.user import User, UserRole
from app.schemas.maintenance import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceAssignmentCreate,
    MaintenanceAssignmentUpdate,
)


def _load_request(db: Session, request_id: uuid.UUID) -> MaintenanceRequest:
    req = (
        db.query(MaintenanceRequest)
        .filter(MaintenanceRequest.id == request_id)
        .options(
            joinedload(MaintenanceRequest.tenant),
            joinedload(MaintenanceRequest.assignments).joinedload(MaintenanceAssignment.staff),
            joinedload(MaintenanceRequest.assignments).joinedload(MaintenanceAssignment.assigner),
        )
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    return req


def _assert_unit_belongs_to_tenant(db: Session, unit_id: uuid.UUID, tenant_id: uuid.UUID):
    """Tenant must have an active assignment on the unit."""
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


def _assert_request_belongs_to_landlord(
    db: Session, request: MaintenanceRequest, landlord_id: uuid.UUID
):
    unit = (
        db.query(Unit)
        .join(Property, Unit.property_id == Property.id)
        .filter(Unit.id == request.unit_id, Property.landlord_id == landlord_id)
        .first()
    )
    if not unit:
        raise HTTPException(
            status_code=403,
            detail="This request does not belong to your properties",
        )


# ── Tenant operations ─────────────────────────────────────────────────────────

def create_request(
    db: Session, data: MaintenanceRequestCreate, tenant_id: uuid.UUID
) -> MaintenanceRequest:
    _assert_unit_belongs_to_tenant(db, data.unit_id, tenant_id)

    req = MaintenanceRequest(
        unit_id=data.unit_id,
        tenant_id=tenant_id,
        category=data.category,
        title=data.title,
        description=data.description,
        priority=data.priority,
        attachment_url=data.attachment_url,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return _load_request(db, req.id)


def get_tenant_requests(
    db: Session, tenant_id: uuid.UUID
) -> List[MaintenanceRequest]:
    return (
        db.query(MaintenanceRequest)
        .filter(MaintenanceRequest.tenant_id == tenant_id)
        .options(
            joinedload(MaintenanceRequest.assignments).joinedload(MaintenanceAssignment.staff),
        )
        .order_by(MaintenanceRequest.created_at.desc())
        .all()
    )


def get_tenant_request(
    db: Session, request_id: uuid.UUID, tenant_id: uuid.UUID
) -> MaintenanceRequest:
    req = _load_request(db, request_id)
    if str(req.tenant_id) != str(tenant_id):
        raise HTTPException(status_code=403, detail="Not your request")
    return req


# ── Landlord operations ───────────────────────────────────────────────────────

def get_landlord_requests(
    db: Session, landlord_id: uuid.UUID
) -> List[MaintenanceRequest]:
    return (
        db.query(MaintenanceRequest)
        .join(Unit, MaintenanceRequest.unit_id == Unit.id)
        .join(Property, Unit.property_id == Property.id)
        .filter(Property.landlord_id == landlord_id)
        .options(
            joinedload(MaintenanceRequest.tenant),
            joinedload(MaintenanceRequest.assignments).joinedload(MaintenanceAssignment.staff),
        )
        .order_by(MaintenanceRequest.created_at.desc())
        .all()
    )


def update_request(
    db: Session,
    request_id: uuid.UUID,
    data: MaintenanceRequestUpdate,
    landlord_id: uuid.UUID,
) -> MaintenanceRequest:
    req = _load_request(db, request_id)
    _assert_request_belongs_to_landlord(db, req, landlord_id)

    if data.status is not None:
        req.status = data.status
        if data.status == RequestStatus.resolved:
            req.resolved_at = datetime.now(timezone.utc)
    if data.priority is not None:
        req.priority = data.priority
    if data.title is not None:
        req.title = data.title
    if data.description is not None:
        req.description = data.description

    db.commit()
    db.refresh(req)
    return _load_request(db, req.id)


def assign_staff(
    db: Session,
    request_id: uuid.UUID,
    data: MaintenanceAssignmentCreate,
    landlord_id: uuid.UUID,
) -> MaintenanceRequest:
    req = _load_request(db, request_id)
    _assert_request_belongs_to_landlord(db, req, landlord_id)

    # Staff user must exist and have role=maintenance_staff
    staff = db.query(User).filter(User.id == data.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff user not found")
    if staff.role != UserRole.maintenance_staff:
        raise HTTPException(status_code=400, detail="Target user is not a maintenance staff member")

    assignment = MaintenanceAssignment(
        request_id=request_id,
        staff_id=data.staff_id,
        assigned_by=landlord_id,
        notes=data.notes,
    )
    db.add(assignment)

    # Auto-move request to in_progress if it was open
    if req.status == RequestStatus.open:
        req.status = RequestStatus.in_progress

    db.commit()
    return _load_request(db, request_id)


# ── Staff operations ──────────────────────────────────────────────────────────

def get_staff_assignments(
    db: Session, staff_id: uuid.UUID
) -> List[MaintenanceAssignment]:
    return (
        db.query(MaintenanceAssignment)
        .filter(MaintenanceAssignment.staff_id == staff_id)
        .options(
            joinedload(MaintenanceAssignment.request).joinedload(MaintenanceRequest.tenant),
            joinedload(MaintenanceAssignment.assigner),
        )
        .order_by(MaintenanceAssignment.created_at.desc())
        .all()
    )


def update_staff_assignment(
    db: Session,
    assignment_id: uuid.UUID,
    data: MaintenanceAssignmentUpdate,
    staff_id: uuid.UUID,
) -> MaintenanceAssignment:
    assignment = (
        db.query(MaintenanceAssignment)
        .filter(
            MaintenanceAssignment.id == assignment_id,
            MaintenanceAssignment.staff_id == staff_id,
        )
        .options(
            joinedload(MaintenanceAssignment.request),
            joinedload(MaintenanceAssignment.staff),
            joinedload(MaintenanceAssignment.assigner),
        )
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found or not assigned to you")

    if data.status is not None:
        assignment.status = data.status
        if data.status == StaffWorkStatus.completed:
            assignment.completed_at = datetime.now(timezone.utc)
    if data.notes is not None:
        assignment.notes = data.notes

    db.commit()
    db.refresh(assignment)
    return assignment
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.maintenance import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceRequestResponse,
    MaintenanceAssignmentCreate,
    MaintenanceAssignmentUpdate,
    StaffAssignmentResponse,
)
from app.services import maintenance_service
from app.schemas.assignment import TenantSearchResult


router = APIRouter(prefix="/api/v1/maintenance", tags=["Maintenance"])


# ── Role dependencies ─────────────────────────────────────────────────────────

def tenant_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.tenant:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenants only")
    return current_user


def landlord_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.landlord:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Landlords only")
    return current_user


def staff_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.maintenance_staff:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Maintenance staff only")
    return current_user


# ── Tenant endpoints ──────────────────────────────────────────────────────────

@router.post("/requests", response_model=MaintenanceRequestResponse, status_code=201)
def create_request(
    data: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(tenant_user),
):
    return maintenance_service.create_request(db, data, current_user.id)


@router.get("/requests/my", response_model=List[MaintenanceRequestResponse])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(tenant_user),
):
    return maintenance_service.get_tenant_requests(db, current_user.id)


@router.get("/requests/{request_id}", response_model=MaintenanceRequestResponse)
def get_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Accessible by the tenant who owns it, their landlord, or assigned staff."""
    if current_user.role == UserRole.tenant:
        return maintenance_service.get_tenant_request(db, request_id, current_user.id)
    elif current_user.role == UserRole.landlord:
        req = maintenance_service._load_request(db, request_id)
        maintenance_service._assert_request_belongs_to_landlord(db, req, current_user.id)
        return req
    elif current_user.role == UserRole.maintenance_staff:
        req = maintenance_service._load_request(db, request_id)
        return req
    raise HTTPException(status_code=403, detail="Access denied")


# ── Landlord endpoints ────────────────────────────────────────────────────────

@router.get("/requests", response_model=List[MaintenanceRequestResponse])
def get_all_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return maintenance_service.get_landlord_requests(db, current_user.id)


@router.patch("/requests/{request_id}", response_model=MaintenanceRequestResponse)
def update_request(
    request_id: uuid.UUID,
    data: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return maintenance_service.update_request(db, request_id, data, current_user.id)


@router.post("/requests/{request_id}/assign", response_model=MaintenanceRequestResponse)
def assign_staff(
    request_id: uuid.UUID,
    data: MaintenanceAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return maintenance_service.assign_staff(db, request_id, data, current_user.id)


# ── Staff endpoints ───────────────────────────────────────────────────────────

@router.get("/assignments/my", response_model=List[StaffAssignmentResponse])
def get_my_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(staff_user),
):
    return maintenance_service.get_staff_assignments(db, current_user.id)


@router.patch("/assignments/{assignment_id}", response_model=StaffAssignmentResponse)
def update_assignment(
    assignment_id: uuid.UUID,
    data: MaintenanceAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(staff_user),
):
    return maintenance_service.update_staff_assignment(db, assignment_id, data, current_user.id)


@router.get("/staff/search", response_model=List[TenantSearchResult])
def search_staff(
    email: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    """Search maintenance staff users by email fragment."""
    return (
        db.query(User)
        .filter(
            User.role == UserRole.maintenance_staff,
            User.email.ilike(f"%{email}%"),
        )
        .limit(10)
        .all()
    )

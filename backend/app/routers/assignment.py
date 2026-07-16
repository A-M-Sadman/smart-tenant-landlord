import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentResponse,
    TenantSearchResult,
)
from app.services import assignment_service

router = APIRouter(prefix="/api/v1", tags=["Assignments"])


def landlord_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.landlord:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only landlords can access this resource",
        )
    return current_user


# ── Tenant search (must be before /assignments to avoid route conflict) ──────
def tenant_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.tenant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenants only",
        )
    return current_user


@router.get("/tenants/search", response_model=List[TenantSearchResult])
def search_tenants(
    email: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    """Search registered tenant users by email fragment."""
    return assignment_service.search_tenants(db, email)


# ── Assignments ───────────────────────────────────────────────────────────────


@router.post("/assignments", response_model=AssignmentResponse, status_code=201)
def create_assignment(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return assignment_service.create_assignment(db, data, current_user.id)


@router.get("/assignments", response_model=List[AssignmentResponse])
def list_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return assignment_service.get_assignments(db, current_user.id)


@router.get("/assignments/mine", response_model=Optional[AssignmentResponse])
def get_my_active_assignment(
    db: Session = Depends(get_db),
    current_user: User = Depends(tenant_user),  # ← must be tenant_user, NOT landlord_user
):
    from app.models.assignment import TenantAssignment, AssignmentStatus
    from sqlalchemy.orm import joinedload
    assignment = (
        db.query(TenantAssignment)
        .filter(
            TenantAssignment.tenant_id == current_user.id,
            TenantAssignment.status == AssignmentStatus.active,
        )
        .options(joinedload(TenantAssignment.unit))
        .first()
    )
    return assignment

@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return assignment_service.get_assignment(db, assignment_id, current_user.id)


@router.patch("/assignments/{assignment_id}", response_model=AssignmentResponse)
def update_assignment(
    assignment_id: uuid.UUID,
    data: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return assignment_service.update_assignment(db, assignment_id, data, current_user.id)


@router.post("/assignments/{assignment_id}/end", response_model=AssignmentResponse)
def end_assignment(
    assignment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    """Shortcut to mark an assignment as past without a full PATCH body."""
    return assignment_service.end_assignment(db, assignment_id, current_user.id)


@router.delete("/assignments/{assignment_id}", status_code=204)
def delete_assignment(
    assignment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    assignment_service.delete_assignment(db, assignment_id, current_user.id)


# ── Unit-scoped active assignment ─────────────────────────────────────────────


@router.get(
    "/units/{unit_id}/assignment",
    response_model=Optional[AssignmentResponse],
)
def get_unit_active_assignment(
    unit_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    """Returns the current active assignment for a unit, or null."""
    return assignment_service.get_unit_active_assignment(db, unit_id, current_user.id)



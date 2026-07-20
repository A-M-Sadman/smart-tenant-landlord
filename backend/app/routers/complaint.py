import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintResponse,
    ComplaintResponseCreate,
)
from app.services import complaint_service

router = APIRouter(prefix="/api/v1/complaints", tags=["Complaints"])


def tenant_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.tenant:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenants only")
    return current_user


def landlord_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.landlord:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Landlords only")
    return current_user


# ── Static routes first ───────────────────────────────────────────────────────

@router.post("", response_model=ComplaintResponse, status_code=201)
def create_complaint(
    data: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(tenant_user),
):
    return complaint_service.create_complaint(db, data, current_user.id)


@router.get("/my", response_model=List[ComplaintResponse])
def get_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(tenant_user),
):
    return complaint_service.get_tenant_complaints(db, current_user.id)

@router.delete("/{complaint_id}", status_code=204)
def delete_complaint(
    complaint_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(tenant_user),
):
    complaint_service.delete_complaint(db, complaint_id, current_user.id)


@router.get("", response_model=List[ComplaintResponse])
def get_all_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return complaint_service.get_landlord_complaints(db, current_user.id)


# ── Parameterized routes ──────────────────────────────────────────────────────

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_landlord = current_user.role == UserRole.landlord
    return complaint_service.get_complaint(db, complaint_id, current_user.id, is_landlord)


@router.patch("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: uuid.UUID,
    data: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return complaint_service.update_complaint(db, complaint_id, data, current_user.id)


@router.post("/{complaint_id}/respond", response_model=ComplaintResponse)
def add_response(
    complaint_id: uuid.UUID,
    data: ComplaintResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return complaint_service.add_response(
        db, complaint_id, data, current_user.id, current_user.id
    )

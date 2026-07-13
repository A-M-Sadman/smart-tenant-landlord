import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.agreement import (
    AgreementCreate,
    AgreementUpdate,
    AgreementResponse,
)
from app.services import agreement_service

router = APIRouter(prefix="/api/v1/agreements", tags=["Agreements"])


def landlord_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.landlord:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only landlords can access this resource",
        )
    return current_user


@router.post("", response_model=AgreementResponse, status_code=201)
def create_agreement(
    data: AgreementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return agreement_service.create_agreement(db, data, current_user.id)


@router.get("", response_model=List[AgreementResponse])
def list_agreements(
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return agreement_service.get_agreements(db, current_user.id)


@router.get("/assignment/{assignment_id}", response_model=Optional[AgreementResponse])
def get_by_assignment(
    assignment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return agreement_service.get_agreement_by_assignment(db, assignment_id, current_user.id)


@router.get("/{agreement_id}", response_model=AgreementResponse)
def get_agreement(
    agreement_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return agreement_service.get_agreement(db, agreement_id, current_user.id)


@router.patch("/{agreement_id}", response_model=AgreementResponse)
def update_agreement(
    agreement_id: uuid.UUID,
    data: AgreementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return agreement_service.update_agreement(db, agreement_id, data, current_user.id)


@router.post("/{agreement_id}/activate", response_model=AgreementResponse)
def activate_agreement(
    agreement_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return agreement_service.activate_agreement(db, agreement_id, current_user.id)


@router.delete("/{agreement_id}", status_code=204)
def delete_agreement(
    agreement_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    agreement_service.delete_agreement(db, agreement_id, current_user.id)
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from app.services import payment_service

router = APIRouter(prefix="/api/v1/payments", tags=["Payments"])


def landlord_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.landlord:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only landlords can access this resource",
        )
    return current_user


def tenant_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.tenant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tenants can access this resource",
        )
    return current_user


# ── Static routes first (before /{id}) ───────────────────────────────────────

@router.get("/my", response_model=List[PaymentResponse])
def get_my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(tenant_user),
):
    """Tenant views their own payment history."""
    return payment_service.get_tenant_payments(db, current_user.id)


@router.get("/agreement/{agreement_id}", response_model=List[PaymentResponse])
def get_payments_by_agreement(
    agreement_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return payment_service.get_payments_by_agreement(db, agreement_id, current_user.id)


# ── Landlord CRUD ─────────────────────────────────────────────────────────────

@router.post("", response_model=PaymentResponse, status_code=201)
def create_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return payment_service.create_payment(db, data, current_user.id)


@router.get("", response_model=List[PaymentResponse])
def list_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return payment_service.get_payments(db, current_user.id)


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return payment_service.get_payment(db, payment_id, current_user.id)


@router.patch("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: uuid.UUID,
    data: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return payment_service.update_payment(db, payment_id, data, current_user.id)


@router.delete("/{payment_id}", status_code=204)
def delete_payment(
    payment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    payment_service.delete_payment(db, payment_id, current_user.id)
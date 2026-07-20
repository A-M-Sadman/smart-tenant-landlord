import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.payment import RentPayment, PaymentStatus
from app.models.agreement import RentalAgreement, AgreementStatus
from app.schemas.payment import PaymentCreate, PaymentUpdate


def _load_payment(db: Session, payment_id: uuid.UUID) -> RentPayment:
    payment = (
        db.query(RentPayment)
        .filter(RentPayment.id == payment_id)
        .options(
            joinedload(RentPayment.tenant),
            joinedload(RentPayment.agreement),
        )
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


def _get_agreement_owned_by_landlord(
    db: Session, agreement_id: uuid.UUID, landlord_id: uuid.UUID
) -> RentalAgreement:
    agreement = (
        db.query(RentalAgreement)
        .filter(
            RentalAgreement.id == agreement_id,
            RentalAgreement.landlord_id == landlord_id,
        )
        .first()
    )
    if not agreement:
        raise HTTPException(
            status_code=404,
            detail="Agreement not found or does not belong to you",
        )
    return agreement


def _assert_payment_owned_by_landlord(
    db: Session, payment: RentPayment, landlord_id: uuid.UUID
):
    agreement = (
        db.query(RentalAgreement)
        .filter(
            RentalAgreement.id == payment.agreement_id,
            RentalAgreement.landlord_id == landlord_id,
        )
        .first()
    )
    if not agreement:
        raise HTTPException(
            status_code=403,
            detail="This payment does not belong to your agreements",
        )


def create_payment(
    db: Session, data: PaymentCreate, landlord_id: uuid.UUID
) -> RentPayment:
    agreement = _get_agreement_owned_by_landlord(db, data.agreement_id, landlord_id)

    if agreement.status not in (AgreementStatus.active,):
        raise HTTPException(
            status_code=400,
            detail="Can only create payments for active agreements",
        )

    paid_date = data.paid_date
    status = data.status
    if status == PaymentStatus.paid and paid_date is None:
        paid_date = date.today()

    payment = RentPayment(
        agreement_id=data.agreement_id,
        tenant_id=agreement.tenant_id,
        amount=data.amount,
        due_date=data.due_date,
        paid_date=paid_date,
        payment_method=data.payment_method,
        status=status,
        transaction_reference=data.transaction_reference,
        notes=data.notes,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return _load_payment(db, payment.id)


def get_payments(db: Session, landlord_id: uuid.UUID) -> List[RentPayment]:
    return (
        db.query(RentPayment)
        .join(RentalAgreement, RentPayment.agreement_id == RentalAgreement.id)
        .filter(RentalAgreement.landlord_id == landlord_id)
        .options(
            joinedload(RentPayment.tenant),
            joinedload(RentPayment.agreement),
        )
        .order_by(RentPayment.due_date.desc())
        .all()
    )


def get_payment(
    db: Session, payment_id: uuid.UUID, landlord_id: uuid.UUID
) -> RentPayment:
    payment = _load_payment(db, payment_id)
    _assert_payment_owned_by_landlord(db, payment, landlord_id)
    return payment


def get_payments_by_agreement(
    db: Session, agreement_id: uuid.UUID, landlord_id: uuid.UUID
) -> List[RentPayment]:
    _get_agreement_owned_by_landlord(db, agreement_id, landlord_id)
    return (
        db.query(RentPayment)
        .filter(RentPayment.agreement_id == agreement_id)
        .options(
            joinedload(RentPayment.tenant),
            joinedload(RentPayment.agreement),
        )
        .order_by(RentPayment.due_date.desc())
        .all()
    )


def update_payment(
    db: Session,
    payment_id: uuid.UUID,
    data: PaymentUpdate,
    landlord_id: uuid.UUID,
) -> RentPayment:
    payment = _load_payment(db, payment_id)
    _assert_payment_owned_by_landlord(db, payment, landlord_id)

    if data.amount is not None:
        payment.amount = data.amount
    if data.due_date is not None:
        payment.due_date = data.due_date
    if data.payment_method is not None:
        payment.payment_method = data.payment_method
    if data.transaction_reference is not None:
        payment.transaction_reference = data.transaction_reference
    if data.notes is not None:
        payment.notes = data.notes
    if data.status is not None:
        payment.status = data.status
        if data.status == PaymentStatus.paid and payment.paid_date is None:
            payment.paid_date = data.paid_date or date.today()
    if data.paid_date is not None:
        payment.paid_date = data.paid_date

    db.commit()
    db.refresh(payment)
    return _load_payment(db, payment.id)


def delete_payment(
    db: Session, payment_id: uuid.UUID, landlord_id: uuid.UUID
) -> None:
    payment = _load_payment(db, payment_id)
    _assert_payment_owned_by_landlord(db, payment, landlord_id)
    db.delete(payment)
    db.commit()


def get_tenant_payments(
    db: Session, tenant_id: uuid.UUID
) -> List[RentPayment]:
    return (
        db.query(RentPayment)
        .filter(RentPayment.tenant_id == tenant_id)
        .options(
            joinedload(RentPayment.agreement),
        )
        .order_by(RentPayment.due_date.desc())
        .all()
    )
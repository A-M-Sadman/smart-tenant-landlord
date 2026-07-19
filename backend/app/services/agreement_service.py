import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.agreement import RentalAgreement, AgreementStatus
from app.models.assignment import TenantAssignment, AssignmentStatus
from app.models.property import Property
from app.models.unit import Unit
from app.schemas.agreement import AgreementCreate, AgreementUpdate


def _load_agreement(db: Session, agreement_id: uuid.UUID) -> RentalAgreement:
    agreement = (
        db.query(RentalAgreement)
        .filter(RentalAgreement.id == agreement_id)
        .options(
            joinedload(RentalAgreement.landlord),
            joinedload(RentalAgreement.tenant),
            joinedload(RentalAgreement.assignment),
        )
        .first()
    )
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    return agreement


def _assert_owned_by_landlord(agreement: RentalAgreement, landlord_id: uuid.UUID):
    if str(agreement.landlord_id) != str(landlord_id):
        raise HTTPException(status_code=403, detail="This agreement does not belong to you")


def _get_active_assignment(
    db: Session, assignment_id: uuid.UUID, landlord_id: uuid.UUID
) -> TenantAssignment:
    assignment = (
        db.query(TenantAssignment)
        .join(Unit, TenantAssignment.unit_id == Unit.id)
        .join(Property, Unit.property_id == Property.id)
        .filter(
            TenantAssignment.id == assignment_id,
            TenantAssignment.status == AssignmentStatus.active,
            Property.landlord_id == landlord_id,
        )
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Active assignment not found or does not belong to your properties",
        )
    return assignment


def create_agreement(
    db: Session, data: AgreementCreate, landlord_id: uuid.UUID
) -> RentalAgreement:
    # Assignment must be active and owned by landlord
    assignment = _get_active_assignment(db, data.assignment_id, landlord_id)

    # Only one agreement per assignment
    existing = (
        db.query(RentalAgreement)
        .filter(RentalAgreement.assignment_id == data.assignment_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="An agreement already exists for this assignment",
        )

    if data.end_date <= data.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date",
        )

    agreement = RentalAgreement(
        assignment_id=data.assignment_id,
        landlord_id=landlord_id,
        tenant_id=assignment.tenant_id,
        start_date=data.start_date,
        end_date=data.end_date,
        monthly_rent=data.monthly_rent,
        security_deposit=data.security_deposit,
        terms=data.terms,
        status=AgreementStatus.draft,
    )
    db.add(agreement)
    db.commit()
    db.refresh(agreement)
    return _load_agreement(db, agreement.id)


def get_agreements(db: Session, landlord_id: uuid.UUID) -> List[RentalAgreement]:
    return (
        db.query(RentalAgreement)
        .filter(RentalAgreement.landlord_id == landlord_id)
        .options(
            joinedload(RentalAgreement.landlord),
            joinedload(RentalAgreement.tenant),
            joinedload(RentalAgreement.assignment),
        )
        .order_by(RentalAgreement.created_at.desc())
        .all()
    )


def get_agreement(
    db: Session, agreement_id: uuid.UUID, landlord_id: uuid.UUID
) -> RentalAgreement:
    agreement = _load_agreement(db, agreement_id)
    _assert_owned_by_landlord(agreement, landlord_id)
    return agreement


def get_agreement_by_assignment(
    db: Session, assignment_id: uuid.UUID, landlord_id: uuid.UUID
) -> Optional[RentalAgreement]:
    agreement = (
        db.query(RentalAgreement)
        .filter(RentalAgreement.assignment_id == assignment_id)
        .options(
            joinedload(RentalAgreement.landlord),
            joinedload(RentalAgreement.tenant),
            joinedload(RentalAgreement.assignment),
        )
        .first()
    )
    if not agreement:
        return None
    _assert_owned_by_landlord(agreement, landlord_id)
    return agreement


def update_agreement(
    db: Session,
    agreement_id: uuid.UUID,
    data: AgreementUpdate,
    landlord_id: uuid.UUID,
) -> RentalAgreement:
    agreement = _load_agreement(db, agreement_id)
    _assert_owned_by_landlord(agreement, landlord_id)

    if agreement.status != AgreementStatus.draft:
        raise HTTPException(
            status_code=400,
            detail="Only draft agreements can be edited",
        )

    if data.start_date is not None:
        agreement.start_date = data.start_date
    if data.end_date is not None:
        agreement.end_date = data.end_date
    if data.monthly_rent is not None:
        agreement.monthly_rent = data.monthly_rent
    if data.security_deposit is not None:
        agreement.security_deposit = data.security_deposit
    if data.terms is not None:
        agreement.terms = data.terms

    if agreement.end_date <= agreement.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    db.commit()
    db.refresh(agreement)
    return _load_agreement(db, agreement.id)


def activate_agreement(
    db: Session, agreement_id: uuid.UUID, landlord_id: uuid.UUID
) -> RentalAgreement:
    agreement = _load_agreement(db, agreement_id)
    _assert_owned_by_landlord(agreement, landlord_id)

    if agreement.status != AgreementStatus.draft:
        raise HTTPException(
            status_code=400,
            detail="Only draft agreements can be activated",
        )

    agreement.status = AgreementStatus.active
    agreement.signed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(agreement)
    return _load_agreement(db, agreement.id)


def delete_agreement(
    db: Session, agreement_id: uuid.UUID, landlord_id: uuid.UUID
) -> None:
    agreement = _load_agreement(db, agreement_id)
    _assert_owned_by_landlord(agreement, landlord_id)

    if agreement.status != AgreementStatus.draft:
        raise HTTPException(
            status_code=400,
            detail="Only draft agreements can be deleted",
        )

    db.delete(agreement)
    db.commit()
    
def get_tenant_agreements(
    db: Session, tenant_id: uuid.UUID
) -> List[RentalAgreement]:
    return (
        db.query(RentalAgreement)
        .filter(RentalAgreement.tenant_id == tenant_id)
        .options(
            joinedload(RentalAgreement.landlord),
            joinedload(RentalAgreement.tenant),
            joinedload(RentalAgreement.assignment),
        )
        .order_by(RentalAgreement.created_at.desc())
        .all()
    )


def accept_agreement(
    db: Session, agreement_id: uuid.UUID, tenant_id: uuid.UUID
) -> RentalAgreement:
    agreement = _load_agreement(db, agreement_id)

    if str(agreement.tenant_id) != str(tenant_id):
        raise HTTPException(
            status_code=403,
            detail="This agreement does not belong to you",
        )

    if agreement.status != AgreementStatus.active:
        raise HTTPException(
            status_code=400,
            detail="Only active agreements can be accepted",
        )

    if agreement.tenant_accepted_at is not None:
        raise HTTPException(
            status_code=400,
            detail="Agreement has already been accepted",
        )

    agreement.tenant_accepted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(agreement)
    return _load_agreement(db, agreement.id)
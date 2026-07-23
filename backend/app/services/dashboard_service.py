import uuid
from typing import List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.user import User, UserRole
from app.models.property import Property
from app.models.unit import Unit
from app.models.assignment import TenantAssignment, AssignmentStatus
from app.models.agreement import RentalAgreement, AgreementStatus
from app.models.maintenance import MaintenanceRequest, RequestStatus as MaintStatus
from app.models.payment import RentPayment, PaymentStatus
from app.models.complaint import Complaint, ComplaintStatus
from app.schemas.dashboard import (
    LandlordStats,
    LandlordDashboardResponse,
    RecentActivity,
    AdminUserResponse,
    AdminPropertyResponse,
    PlatformStats,
)
from datetime import datetime, timezone


def get_landlord_dashboard(db: Session, landlord_id: uuid.UUID) -> LandlordDashboardResponse:
    # Get all property IDs for this landlord
    property_ids = [
        p.id for p in db.query(Property.id).filter(Property.landlord_id == landlord_id).all()
    ]
    unit_ids = [
        u.id for u in db.query(Unit.id).filter(Unit.property_id.in_(property_ids)).all()
    ] if property_ids else []

    # Stats
    total_properties = len(property_ids)
    total_units = len(unit_ids)

    total_tenants = (
        db.query(TenantAssignment)
        .filter(
            TenantAssignment.unit_id.in_(unit_ids),
            TenantAssignment.status == AssignmentStatus.active,
        )
        .count()
    ) if unit_ids else 0

    open_maintenance = (
        db.query(MaintenanceRequest)
        .filter(
            MaintenanceRequest.unit_id.in_(unit_ids),
            MaintenanceRequest.status == MaintStatus.open,
        )
        .count()
    ) if unit_ids else 0

    # Agreement IDs for this landlord
    agreement_ids = [
        a.id for a in db.query(RentalAgreement.id).filter(
            RentalAgreement.landlord_id == landlord_id
        ).all()
    ]

    pending_payments = (
        db.query(RentPayment)
        .filter(
            RentPayment.agreement_id.in_(agreement_ids),
            RentPayment.status == PaymentStatus.pending,
        )
        .count()
    ) if agreement_ids else 0

    overdue_payments = (
        db.query(RentPayment)
        .filter(
            RentPayment.agreement_id.in_(agreement_ids),
            RentPayment.status == PaymentStatus.overdue,
        )
        .count()
    ) if agreement_ids else 0

    open_complaints = (
        db.query(Complaint)
        .filter(
            Complaint.unit_id.in_(unit_ids),
            Complaint.status == ComplaintStatus.open,
        )
        .count()
    ) if unit_ids else 0

    open_assignments = (
        db.query(TenantAssignment)
        .filter(
            TenantAssignment.unit_id.in_(unit_ids),
            TenantAssignment.status == AssignmentStatus.active,
        )
        .count()
    ) if unit_ids else 0

    open_agreements = (
        db.query(RentalAgreement)
        .filter(
            RentalAgreement.landlord_id == landlord_id,
            RentalAgreement.status == AgreementStatus.active,
        )
        .count()
    )

    stats = LandlordStats(
        total_properties=total_properties,
        total_units=total_units,
        total_tenants=total_tenants,
        open_maintenance_requests=open_maintenance,
        pending_payments=pending_payments,
        overdue_payments=overdue_payments,
        open_complaints=open_complaints,
        open_assignments=open_assignments,
        open_agreements=open_agreements,
    )

    # Recent activity — last 5 maintenance requests + complaints
    recent: List[RecentActivity] = []

    if unit_ids:
        recent_maintenance = (
            db.query(MaintenanceRequest)
            .filter(MaintenanceRequest.unit_id.in_(unit_ids))
            .order_by(MaintenanceRequest.created_at.desc())
            .limit(3)
            .all()
        )
        for m in recent_maintenance:
            recent.append(RecentActivity(
                type="maintenance",
                description=f"Maintenance request: {m.title} ({m.status})",
                timestamp=m.created_at,
            ))

        recent_complaints = (
            db.query(Complaint)
            .filter(Complaint.unit_id.in_(unit_ids))
            .order_by(Complaint.created_at.desc())
            .limit(3)
            .all()
        )
        for c in recent_complaints:
            recent.append(RecentActivity(
                type="complaint",
                description=f"Complaint: {c.subject} ({c.status})",
                timestamp=c.created_at,
            ))

    recent_payments = (
        db.query(RentPayment)
        .filter(RentPayment.agreement_id.in_(agreement_ids))
        .order_by(RentPayment.created_at.desc())
        .limit(3)
        .all()
    ) if agreement_ids else []

    for p in recent_payments:
        recent.append(RecentActivity(
            type="payment",
            description=f"Payment of ৳{p.amount} — {p.status}",
            timestamp=p.created_at,
        ))

    recent.sort(key=lambda x: x.timestamp, reverse=True)

    return LandlordDashboardResponse(stats=stats, recent_activity=recent[:8])


# ── Admin operations ──────────────────────────────────────────────────────────

def get_all_users(db: Session) -> List[User]:
    return db.query(User).order_by(User.created_at.desc()).all()


def activate_user(db: Session, user_id: uuid.UUID) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user_id: uuid.UUID) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.admin:
        raise HTTPException(status_code=400, detail="Cannot deactivate an admin account")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def get_all_properties(db: Session) -> List[dict]:
    properties = (
        db.query(Property)
        .options(joinedload(Property.landlord))
        .order_by(Property.created_at.desc())
        .all()
    )
    result = []
    for p in properties:
        result.append({
            "id": p.id,
            "name": p.name,
            "address": p.address,
            "city": p.city,
            "district": p.district,
            "total_units": p.total_units,
            "landlord_id": p.landlord_id,
            "landlord_email": p.landlord.email if p.landlord else None,
            "landlord_name": p.landlord.full_name if p.landlord else None,
            "created_at": p.created_at,
        })
    return result


def get_platform_stats(db: Session) -> PlatformStats:
    total_users = db.query(User).count()
    total_landlords = db.query(User).filter(User.role == UserRole.landlord).count()
    total_tenants = db.query(User).filter(User.role == UserRole.tenant).count()
    total_staff = db.query(User).filter(User.role == UserRole.maintenance_staff).count()
    total_admins = db.query(User).filter(User.role == UserRole.admin).count()
    total_properties = db.query(Property).count()
    total_units = db.query(Unit).count()
    total_active_assignments = db.query(TenantAssignment).filter(
        TenantAssignment.status == AssignmentStatus.active
    ).count()
    total_active_agreements = db.query(RentalAgreement).filter(
        RentalAgreement.status == AgreementStatus.active
    ).count()
    total_open_complaints = db.query(Complaint).filter(
        Complaint.status == ComplaintStatus.open
    ).count()
    total_open_maintenance = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.status == MaintStatus.open
    ).count()
    total_pending_payments = db.query(RentPayment).filter(
        RentPayment.status == PaymentStatus.pending
    ).count()

    return PlatformStats(
        total_users=total_users,
        total_landlords=total_landlords,
        total_tenants=total_tenants,
        total_maintenance_staff=total_staff,
        total_admins=total_admins,
        total_properties=total_properties,
        total_units=total_units,
        total_active_assignments=total_active_assignments,
        total_active_agreements=total_active_agreements,
        total_open_complaints=total_open_complaints,
        total_open_maintenance=total_open_maintenance,
        total_pending_payments=total_pending_payments,
    )
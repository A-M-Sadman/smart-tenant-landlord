import uuid
from datetime import datetime, date
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.payment import RentPayment, PaymentStatus
from app.models.maintenance import MaintenanceRequest, RequestStatus
from app.models.complaint import Complaint, ComplaintCategory
from app.models.unit import Unit
from app.models.property import Property
from app.models.assignment import TenantAssignment, AssignmentStatus
from app.schemas.analytics import (
    MonthlyRevenue,
    MonthlyPaymentTrend,
    MonthlyMaintenanceTrend,
    OccupancyRate,
    ComplaintByCategory,
    AnalyticsResponse,
)
from app.models.agreement import RentalAgreement


def _get_landlord_unit_ids(db: Session, landlord_id: uuid.UUID) -> List[uuid.UUID]:
    property_ids = [
        p.id for p in db.query(Property.id).filter(Property.landlord_id == landlord_id).all()
    ]
    if not property_ids:
        return []
    return [
        u.id for u in db.query(Unit.id).filter(Unit.property_id.in_(property_ids)).all()
    ]


def _get_landlord_agreement_ids(db: Session, landlord_id: uuid.UUID) -> List[uuid.UUID]:
    return [
        a.id for a in db.query(RentalAgreement.id).filter(
            RentalAgreement.landlord_id == landlord_id
        ).all()
    ]


def _last_6_months() -> List[str]:
    """Returns list of 'YYYY-MM' strings for the last 6 months including current."""
    from dateutil.relativedelta import relativedelta
    today = date.today()
    months = []
    for i in range(5, -1, -1):
        d = today - relativedelta(months=i)
        months.append(f"{d.year}-{d.month:02d}")
    return months


def get_analytics(db: Session, landlord_id: uuid.UUID) -> AnalyticsResponse:
    unit_ids = _get_landlord_unit_ids(db, landlord_id)
    agreement_ids = _get_landlord_agreement_ids(db, landlord_id)
    months = _last_6_months()

    # ── Revenue ───────────────────────────────────────────────────────────────
    revenue = []
    for month in months:
        year, mo = int(month.split('-')[0]), int(month.split('-')[1])

        collected = db.query(func.coalesce(func.sum(RentPayment.amount), 0)).filter(
            RentPayment.agreement_id.in_(agreement_ids),
            RentPayment.status == PaymentStatus.paid,
            extract('year', RentPayment.paid_date) == year,
            extract('month', RentPayment.paid_date) == mo,
        ).scalar() if agreement_ids else 0

        pending = db.query(func.coalesce(func.sum(RentPayment.amount), 0)).filter(
            RentPayment.agreement_id.in_(agreement_ids),
            RentPayment.status == PaymentStatus.pending,
            extract('year', RentPayment.due_date) == year,
            extract('month', RentPayment.due_date) == mo,
        ).scalar() if agreement_ids else 0

        revenue.append(MonthlyRevenue(
            month=month,
            collected=float(collected),
            pending=float(pending),
        ))

    # ── Payment trends ────────────────────────────────────────────────────────
    payment_trends = []
    for month in months:
        year, mo = int(month.split('-')[0]), int(month.split('-')[1])

        def payment_count(status, date_col):
            return db.query(func.count(RentPayment.id)).filter(
                RentPayment.agreement_id.in_(agreement_ids),
                RentPayment.status == status,
                extract('year', date_col) == year,
                extract('month', date_col) == mo,
            ).scalar() if agreement_ids else 0

        paid = payment_count(PaymentStatus.paid, RentPayment.paid_date)
        pending = payment_count(PaymentStatus.pending, RentPayment.due_date)
        overdue = payment_count(PaymentStatus.overdue, RentPayment.due_date)

        payment_trends.append(MonthlyPaymentTrend(
            month=month,
            paid=paid or 0,
            pending=pending or 0,
            overdue=overdue or 0,
        ))

    # ── Maintenance trends ────────────────────────────────────────────────────
    maintenance_trends = []
    for month in months:
        year, mo = int(month.split('-')[0]), int(month.split('-')[1])

        open_count = db.query(func.count(MaintenanceRequest.id)).filter(
            MaintenanceRequest.unit_id.in_(unit_ids),
            MaintenanceRequest.status == RequestStatus.open,
            extract('year', MaintenanceRequest.created_at) == year,
            extract('month', MaintenanceRequest.created_at) == mo,
        ).scalar() if unit_ids else 0

        resolved_count = db.query(func.count(MaintenanceRequest.id)).filter(
            MaintenanceRequest.unit_id.in_(unit_ids),
            MaintenanceRequest.status == RequestStatus.resolved,
            extract('year', MaintenanceRequest.created_at) == year,
            extract('month', MaintenanceRequest.created_at) == mo,
        ).scalar() if unit_ids else 0

        maintenance_trends.append(MonthlyMaintenanceTrend(
            month=month,
            open=open_count or 0,
            resolved=resolved_count or 0,
        ))

    # ── Occupancy ─────────────────────────────────────────────────────────────
    total_units = len(unit_ids)
    occupied_units = db.query(func.count(TenantAssignment.id)).filter(
        TenantAssignment.unit_id.in_(unit_ids),
        TenantAssignment.status == AssignmentStatus.active,
    ).scalar() if unit_ids else 0

    occupied_units = occupied_units or 0
    vacant_units = total_units - occupied_units
    occupancy_rate = (occupied_units / total_units * 100) if total_units > 0 else 0.0

    occupancy = OccupancyRate(
        total_units=total_units,
        occupied_units=occupied_units,
        vacant_units=vacant_units,
        occupancy_rate=round(occupancy_rate, 1),
    )

    # ── Complaints by category ────────────────────────────────────────────────
    complaint_categories = []
    if unit_ids:
        rows = db.query(
            Complaint.category,
            func.count(Complaint.id).label('count')
        ).filter(
            Complaint.unit_id.in_(unit_ids)
        ).group_by(Complaint.category).all()

        for row in rows:
            complaint_categories.append(ComplaintByCategory(
                category=row.category.value if hasattr(row.category, 'value') else str(row.category),
                count=row.count,
            ))

    return AnalyticsResponse(
        revenue=revenue,
        payment_trends=payment_trends,
        maintenance_trends=maintenance_trends,
        occupancy=occupancy,
        complaint_categories=complaint_categories,
    )
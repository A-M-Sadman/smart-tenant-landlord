import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.dashboard import (
    LandlordDashboardResponse,
    AdminUserResponse,
    AdminPropertyResponse,
    PlatformStats,
)
from app.services import dashboard_service

router = APIRouter(tags=["Dashboard & Admin"])


def landlord_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.landlord:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Landlords only",
        )
    return current_user


def admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins only",
        )
    return current_user


# ── Landlord Dashboard ────────────────────────────────────────────────────────

@router.get("/api/v1/dashboard/landlord", response_model=LandlordDashboardResponse)
def get_landlord_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    return dashboard_service.get_landlord_dashboard(db, current_user.id)


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.get("/api/v1/admin/users", response_model=List[AdminUserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_user),
):
    return dashboard_service.get_all_users(db)


@router.patch("/api/v1/admin/users/{user_id}/activate", response_model=AdminUserResponse)
def activate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_user),
):
    return dashboard_service.activate_user(db, user_id)


@router.patch("/api/v1/admin/users/{user_id}/deactivate", response_model=AdminUserResponse)
def deactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_user),
):
    return dashboard_service.deactivate_user(db, user_id)


@router.get("/api/v1/admin/properties", response_model=List[AdminPropertyResponse])
def get_all_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_user),
):
    return dashboard_service.get_all_properties(db)


@router.get("/api/v1/admin/stats", response_model=PlatformStats)
def get_platform_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_user),
):
    return dashboard_service.get_platform_stats(db)



def tenant_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.tenant:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenants only")
    return current_user

def staff_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.maintenance_staff:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff only")
    return current_user

@router.get("/api/v1/dashboard/tenant")
def get_tenant_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(tenant_user),
):
    return dashboard_service.get_tenant_dashboard(db, current_user.id)

@router.get("/api/v1/dashboard/staff")
def get_staff_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(staff_user),
):
    return dashboard_service.get_staff_dashboard(db, current_user.id)
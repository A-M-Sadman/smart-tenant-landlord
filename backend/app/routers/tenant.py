from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.tenant import TenantProfileUpdate, TenantProfileResponse, TenantProfileWithUser
from app.services.tenant_service import get_or_create_profile, update_profile, get_profile_with_user

router = APIRouter(prefix="/tenant", tags=["Tenant Profile"])


@router.get("/profile", response_model=TenantProfileWithUser)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("tenant")),
):
    return get_profile_with_user(db, current_user.id)


@router.patch("/profile", response_model=TenantProfileResponse)
def update_my_profile(
    data: TenantProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("tenant")),
):
    return update_profile(db, current_user.id, data)
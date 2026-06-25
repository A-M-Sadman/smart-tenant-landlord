import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.tenant import TenantProfile
from app.models.user import User
from app.schemas.tenant import TenantProfileUpdate


def get_or_create_profile(db: Session, user_id: uuid.UUID) -> TenantProfile:
    profile = db.query(TenantProfile).filter(TenantProfile.user_id == user_id).first()
    if not profile:
        profile = TenantProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_profile(db: Session, user_id: uuid.UUID, data: TenantProfileUpdate) -> TenantProfile:
    profile = get_or_create_profile(db, user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


def get_profile_with_user(db: Session, user_id: uuid.UUID) -> dict:
    profile = get_or_create_profile(db, user_id)
    user = db.query(User).filter(User.id == user_id).first()
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "nid": profile.nid,
        "emergency_contact_name": profile.emergency_contact_name,
        "emergency_contact_phone": profile.emergency_contact_phone,
        "occupation": profile.occupation,
        "profile_photo_url": profile.profile_photo_url,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
    }
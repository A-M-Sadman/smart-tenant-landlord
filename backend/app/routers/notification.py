import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.notification import (
    NotificationResponse,
    NotificationSend,
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
)
from app.services import notification_service

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


def landlord_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.landlord:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Landlords only",
        )
    return current_user


# ── Static routes first ───────────────────────────────────────────────────────

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.get_notifications(db, current_user.id)


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = notification_service.mark_all_as_read(db, current_user.id)
    return {"marked_read": count}


@router.get("/preferences", response_model=NotificationPreferenceResponse)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.get_preferences(db, current_user.id)


@router.patch("/preferences", response_model=NotificationPreferenceResponse)
def update_preferences(
    data: NotificationPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.update_preferences(db, current_user.id, data)


@router.post("/send", response_model=NotificationResponse, status_code=201)
def send_notification(
    data: NotificationSend,
    db: Session = Depends(get_db),
    current_user: User = Depends(landlord_user),
):
    """Landlord sends a notification to a specific user."""
    return notification_service.send_notification(db, data, current_user.id)


# ── Parameterized routes ──────────────────────────────────────────────────────

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_service.mark_as_read(db, notification_id, current_user.id)


@router.delete("/{notification_id}", status_code=204)
def delete_notification(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification_service.delete_notification(db, notification_id, current_user.id)
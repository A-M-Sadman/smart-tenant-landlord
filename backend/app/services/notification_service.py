import uuid
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.notification import Notification, NotificationPreference
from app.models.user import User
from app.schemas.notification import NotificationSend, NotificationPreferenceUpdate


def get_notifications(db: Session, user_id: uuid.UUID) -> List[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def mark_as_read(db: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> Notification:
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_as_read(db: Session, user_id: uuid.UUID) -> int:
    updated = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read == False)
        .update({"is_read": True})
    )
    db.commit()
    return updated


def delete_notification(db: Session, notification_id: uuid.UUID, user_id: uuid.UUID) -> None:
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notification)
    db.commit()


def get_preferences(db: Session, user_id: uuid.UUID) -> NotificationPreference:
    prefs = (
        db.query(NotificationPreference)
        .filter(NotificationPreference.user_id == user_id)
        .first()
    )
    if not prefs:
        # Auto-create with defaults
        prefs = NotificationPreference(user_id=user_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs


def update_preferences(
    db: Session, user_id: uuid.UUID, data: NotificationPreferenceUpdate
) -> NotificationPreference:
    prefs = get_preferences(db, user_id)

    if data.email_notifications is not None:
        prefs.email_notifications = data.email_notifications
    if data.in_app_notifications is not None:
        prefs.in_app_notifications = data.in_app_notifications
    if data.rent_reminders is not None:
        prefs.rent_reminders = data.rent_reminders
    if data.maintenance_updates is not None:
        prefs.maintenance_updates = data.maintenance_updates
    if data.complaint_updates is not None:
        prefs.complaint_updates = data.complaint_updates

    db.commit()
    db.refresh(prefs)
    return prefs


def send_notification(
    db: Session, data: NotificationSend, sender_id: uuid.UUID
) -> Notification:
    # Verify target user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Create notification for recipient
    notification = Notification(
        user_id=data.user_id,
        type=data.type,
        title=data.title,
        message=data.message,
        related_entity_type=data.related_entity_type,
        related_entity_id=data.related_entity_id,
    )
    db.add(notification)

    # Create a copy for the sender (landlord) so they can see what they sent
    sender_copy = Notification(
        user_id=sender_id,
        type=data.type,
        title=f"Sent: {data.title}",
        message=f"To {user.full_name or user.email}: {data.message}",
        related_entity_type=data.related_entity_type,
        related_entity_id=data.related_entity_id,
    )
    db.add(sender_copy)

    db.commit()
    db.refresh(notification)
    return notification
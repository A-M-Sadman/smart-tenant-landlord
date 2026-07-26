import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class NotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: str
    title: str
    message: str
    is_read: bool
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[uuid.UUID] = None
    created_at: Optional[datetime] = None

    @field_validator("id", "user_id", "related_entity_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class NotificationSend(BaseModel):
    user_id: uuid.UUID
    type: str = "general"
    title: str
    message: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[uuid.UUID] = None


class NotificationPreferenceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    email_notifications: bool
    in_app_notifications: bool
    rent_reminders: bool
    maintenance_updates: bool
    complaint_updates: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator("id", "user_id", mode="before")
    @classmethod
    def uuid_to_str(cls, v):
        return str(v) if isinstance(v, uuid.UUID) else v

    class Config:
        from_attributes = True


class NotificationPreferenceUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    in_app_notifications: Optional[bool] = None
    rent_reminders: Optional[bool] = None
    maintenance_updates: Optional[bool] = None
    complaint_updates: Optional[bool] = None
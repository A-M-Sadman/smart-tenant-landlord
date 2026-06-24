import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse
from app.schemas.unit import UnitCreate, UnitUpdate, UnitResponse
from app.services.property_service import (
    create_property, get_properties, get_property, update_property, delete_property,
    create_unit, get_units, get_unit, update_unit, delete_unit,
)

router = APIRouter(prefix="/properties", tags=["Properties & Units"])


# ── Properties ────────────────────────────────────────────

@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create(
    data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    return create_property(db, data, current_user.id)


@router.get("", response_model=list[PropertyResponse])
def list_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    return get_properties(db, current_user.id)


@router.get("/{property_id}", response_model=PropertyResponse)
def get_one(
    property_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    return get_property(db, property_id, current_user.id)


@router.patch("/{property_id}", response_model=PropertyResponse)
def update(
    property_id: uuid.UUID,
    data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    return update_property(db, property_id, current_user.id, data)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    property_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    delete_property(db, property_id, current_user.id)


# ── Units ─────────────────────────────────────────────────

@router.post("/{property_id}/units", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
def create_unit_endpoint(
    property_id: uuid.UUID,
    data: UnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    return create_unit(db, property_id, current_user.id, data)


@router.get("/{property_id}/units", response_model=list[UnitResponse])
def list_units(
    property_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    return get_units(db, property_id, current_user.id)


@router.get("/{property_id}/units/{unit_id}", response_model=UnitResponse)
def get_unit_endpoint(
    property_id: uuid.UUID,
    unit_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    return get_unit(db, property_id, unit_id, current_user.id)


@router.patch("/{property_id}/units/{unit_id}", response_model=UnitResponse)
def update_unit_endpoint(
    property_id: uuid.UUID,
    unit_id: uuid.UUID,
    data: UnitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    return update_unit(db, property_id, unit_id, current_user.id, data)


@router.delete("/{property_id}/units/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unit_endpoint(
    property_id: uuid.UUID,
    unit_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    delete_unit(db, property_id, unit_id, current_user.id)
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.property import Property
from app.models.unit import Unit
from app.schemas.property import PropertyCreate, PropertyUpdate
from app.schemas.unit import UnitCreate, UnitUpdate


# ── Property ──────────────────────────────────────────────

def create_property(db: Session, data: PropertyCreate, landlord_id: uuid.UUID) -> Property:
    prop = Property(
        landlord_id=landlord_id,
        name=data.name,
        address=data.address,
        city=data.city,
        district=data.district,
        description=data.description,
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


def get_properties(db: Session, landlord_id: uuid.UUID) -> list[Property]:
    return db.query(Property).filter(Property.landlord_id == landlord_id).all()


def get_property(db: Session, property_id: uuid.UUID, landlord_id: uuid.UUID) -> Property:
    prop = db.query(Property).filter(
        Property.id == property_id,
        Property.landlord_id == landlord_id,
    ).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    return prop


def update_property(db: Session, property_id: uuid.UUID, landlord_id: uuid.UUID, data: PropertyUpdate) -> Property:
    prop = get_property(db, property_id, landlord_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(prop, field, value)
    db.commit()
    db.refresh(prop)
    return prop


def delete_property(db: Session, property_id: uuid.UUID, landlord_id: uuid.UUID) -> None:
    prop = get_property(db, property_id, landlord_id)
    db.delete(prop)
    db.commit()


# ── Unit ──────────────────────────────────────────────────

def create_unit(db: Session, property_id: uuid.UUID, landlord_id: uuid.UUID, data: UnitCreate) -> Unit:
    # Verify property belongs to landlord
    prop = get_property(db, property_id, landlord_id)

    # Check duplicate unit number
    existing = db.query(Unit).filter(
        Unit.property_id == property_id,
        Unit.unit_number == data.unit_number,
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Unit number already exists in this property.")

    unit = Unit(
        property_id=property_id,
        unit_number=data.unit_number,
        floor=data.floor,
        bedrooms=data.bedrooms,
        bathrooms=data.bathrooms,
        area_sqft=data.area_sqft,
        rent_amount=data.rent_amount,
    )
    db.add(unit)

    # Update total_units count
    prop.total_units += 1
    db.commit()
    db.refresh(unit)
    return unit


def get_units(db: Session, property_id: uuid.UUID, landlord_id: uuid.UUID) -> list[Unit]:
    get_property(db, property_id, landlord_id)  # verify ownership
    return db.query(Unit).filter(Unit.property_id == property_id).all()


def get_unit(db: Session, property_id: uuid.UUID, unit_id: uuid.UUID, landlord_id: uuid.UUID) -> Unit:
    get_property(db, property_id, landlord_id)  # verify ownership
    unit = db.query(Unit).filter(
        Unit.id == unit_id,
        Unit.property_id == property_id,
    ).first()
    if not unit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found.")
    return unit


def update_unit(db: Session, property_id: uuid.UUID, unit_id: uuid.UUID, landlord_id: uuid.UUID, data: UnitUpdate) -> Unit:
    unit = get_unit(db, property_id, unit_id, landlord_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(unit, field, value)
    db.commit()
    db.refresh(unit)
    return unit


def delete_unit(db: Session, property_id: uuid.UUID, unit_id: uuid.UUID, landlord_id: uuid.UUID) -> None:
    unit = get_unit(db, property_id, unit_id, landlord_id)
    prop = get_property(db, property_id, landlord_id)
    db.delete(unit)
    prop.total_units = max(0, prop.total_units - 1)
    db.commit()
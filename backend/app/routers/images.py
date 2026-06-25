import uuid
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.config import settings
from app.models.user import User
from app.services.property_service import get_property

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

router = APIRouter(tags=["Images"])


class ImageResponse(BaseModel):
    url: str


@router.post("/properties/{property_id}/images", response_model=ImageResponse)
async def upload_property_image(
    property_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("landlord", "admin")),
):
    # Verify ownership
    get_property(db, property_id, current_user.id)

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image.")

    contents = await file.read()
    result = cloudinary.uploader.upload(
        contents,
        folder=f"properties/{property_id}",
        resource_type="image",
    )
    return {"url": result["secure_url"]}
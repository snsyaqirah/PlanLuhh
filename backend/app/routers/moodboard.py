from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os, uuid, aiofiles

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.core.config import settings
from app.models.user import User
from app.models.moodboard import Moodboard, MoodboardCategoryEnum
from app.schemas.moodboard import MoodboardCreate, MoodboardUpdate, MoodboardOut
from app.routers.wedding import _assert_access

router = APIRouter(prefix="/weddings/{wedding_id}/moodboard", tags=["moodboard"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.get("", response_model=List[MoodboardOut])
def list_moodboard(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    return (
        db.query(Moodboard)
        .filter(Moodboard.wedding_id == wedding_id, Moodboard.status == 1)
        .order_by(Moodboard.category, Moodboard.created_at)
        .all()
    )


@router.post("", response_model=MoodboardOut, status_code=201)
def create_moodboard(
    wedding_id: str,
    payload: MoodboardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = Moodboard(wedding_id=wedding_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/upload", response_model=MoodboardOut, status_code=201)
async def upload_moodboard_image(
    wedding_id: str,
    category: MoodboardCategoryEnum = Form(...),
    title: Optional[str] = Form(None),
    note: Optional[str] = Form(None),
    color_hex: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Jenis fail tidak disokong. Gunakan JPG, PNG, atau WebP.")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "moodboard", str(wedding_id))
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "img")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, filename)

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    image_url = f"/uploads/moodboard/{wedding_id}/{filename}"
    item = Moodboard(
        wedding_id=wedding_id,
        category=category,
        title=title,
        note=note,
        color_hex=color_hex,
        image_url=image_url,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=MoodboardOut)
def update_moodboard(
    wedding_id: str,
    item_id: str,
    payload: MoodboardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(Moodboard).filter(
        Moodboard.id == item_id,
        Moodboard.wedding_id == wedding_id,
        Moodboard.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_moodboard(
    wedding_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(Moodboard).filter(
        Moodboard.id == item_id,
        Moodboard.wedding_id == wedding_id,
        Moodboard.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.status = 0
    db.commit()

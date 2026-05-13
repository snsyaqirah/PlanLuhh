from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os, aiofiles

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.core.config import settings
from app.core.security import verify_password, hash_password
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate, ChangePasswordRequest

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_verified_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(current_user, k, v)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Avatar too large (max 2MB)")
    upload_path = os.path.join(settings.UPLOAD_DIR, "avatars")
    os.makedirs(upload_path, exist_ok=True)
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp"):
        raise HTTPException(status_code=422, detail="Only JPG/PNG/WEBP allowed")
    filename = f"{current_user.id}.{ext}"
    file_path = os.path.join(upload_path, filename)
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
    current_user.profile_pic = file_path
    db.commit()
    db.refresh(current_user)
    return current_user

from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from typing import Optional
import jwt

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, UserStatusEnum


def get_current_user(
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    if not access_token:
        raise credentials_exception
    try:
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if not user_id or token_type != "access":
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id, User.status == 1).first()
    if not user:
        raise credentials_exception
    return user


def get_optional_user(
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not access_token:
        return None
    try:
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id or payload.get("type") != "access":
            return None
        return db.query(User).filter(User.id == user_id, User.status == 1).first()
    except Exception:
        return None


def get_verified_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_verified or current_user.account_status != UserStatusEnum.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required",
        )
    return current_user


def get_wedding_collaborator(
    wedding_id: str,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_db),
):
    from app.models.collaborator import WeddingCollaborator
    from app.models.wedding import Wedding
    wedding = db.query(Wedding).filter(
        Wedding.id == wedding_id,
        Wedding.status == 1,
    ).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")

    collab = db.query(WeddingCollaborator).filter(
        WeddingCollaborator.wedding_id == wedding_id,
        WeddingCollaborator.user_id == current_user.id,
        WeddingCollaborator.status == 1,
    ).first()
    if not collab:
        raise HTTPException(status_code=403, detail="Access denied")
    return wedding, collab, current_user

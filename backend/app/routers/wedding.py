from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.wedding import Wedding
from app.models.collaborator import WeddingCollaborator, CollaboratorRoleEnum
from app.schemas.wedding import WeddingCreate, WeddingUpdate, WeddingOut
from app.utils.audit import log_action

router = APIRouter(prefix="/weddings", tags=["weddings"])


@router.post("", response_model=WeddingOut, status_code=201)
def create_wedding(
    payload: WeddingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    wedding = Wedding(**payload.model_dump())
    db.add(wedding)
    db.flush()

    # Creator is ADMIN collaborator
    collab = WeddingCollaborator(
        wedding_id=wedding.id,
        user_id=current_user.id,
        role=CollaboratorRoleEnum.ADMIN,
    )
    db.add(collab)
    log_action(db, "CREATE", user_id=current_user.id, wedding_id=wedding.id, entity_type="wedding", entity_id=wedding.id)
    db.commit()
    db.refresh(wedding)
    return wedding


@router.get("", response_model=List[WeddingOut])
def list_my_weddings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    collabs = db.query(WeddingCollaborator).filter(
        WeddingCollaborator.user_id == current_user.id,
        WeddingCollaborator.status == 1,
    ).all()
    wedding_ids = [c.wedding_id for c in collabs]
    return db.query(Wedding).filter(Wedding.id.in_(wedding_ids), Wedding.status == 1).all()


@router.get("/{wedding_id}", response_model=WeddingOut)
def get_wedding(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    wedding = db.query(Wedding).filter(Wedding.id == wedding_id, Wedding.status == 1).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    return wedding


@router.patch("/{wedding_id}", response_model=WeddingOut)
def update_wedding(
    wedding_id: str,
    payload: WeddingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    wedding = db.query(Wedding).filter(Wedding.id == wedding_id, Wedding.status == 1).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(wedding, k, v)
    log_action(db, "UPDATE", user_id=current_user.id, wedding_id=wedding.id, entity_type="wedding", entity_id=wedding.id)
    db.commit()
    db.refresh(wedding)
    return wedding


@router.delete("/{wedding_id}", status_code=204)
def delete_wedding(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_admin(db, wedding_id, current_user)
    wedding = db.query(Wedding).filter(Wedding.id == wedding_id, Wedding.status == 1).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Not found")
    wedding.status = 0  # soft delete
    log_action(db, "DELETE", user_id=current_user.id, wedding_id=wedding.id, entity_type="wedding", entity_id=wedding.id)
    db.commit()


@router.post("/{wedding_id}/collaborators")
def add_collaborator(
    wedding_id: str,
    user_email: str,
    role: CollaboratorRoleEnum = CollaboratorRoleEnum.VIEWER,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_admin(db, wedding_id, current_user)
    target = db.query(User).filter(User.email == user_email, User.status == 1).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    existing = db.query(WeddingCollaborator).filter(
        WeddingCollaborator.wedding_id == wedding_id,
        WeddingCollaborator.user_id == target.id,
    ).first()
    if existing:
        existing.role = role
        existing.status = 1
    else:
        db.add(WeddingCollaborator(wedding_id=wedding_id, user_id=target.id, role=role))
    db.commit()
    return {"message": "Collaborator added"}


def _assert_access(db, wedding_id, user):
    collab = db.query(WeddingCollaborator).filter(
        WeddingCollaborator.wedding_id == wedding_id,
        WeddingCollaborator.user_id == user.id,
        WeddingCollaborator.status == 1,
    ).first()
    if not collab:
        raise HTTPException(status_code=403, detail="Access denied")


def _assert_admin(db, wedding_id, user):
    collab = db.query(WeddingCollaborator).filter(
        WeddingCollaborator.wedding_id == wedding_id,
        WeddingCollaborator.user_id == user.id,
        WeddingCollaborator.status == 1,
    ).first()
    if not collab or collab.role not in (CollaboratorRoleEnum.ADMIN, CollaboratorRoleEnum.GROOM, CollaboratorRoleEnum.BRIDE):
        raise HTTPException(status_code=403, detail="Admin access required")

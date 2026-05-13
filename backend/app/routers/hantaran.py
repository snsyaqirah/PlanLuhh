from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.hantaran import HantaranItem
from app.schemas.hantaran import HantaranCreate, HantaranUpdate, HantaranOut
from app.routers.wedding import _assert_access

router = APIRouter(prefix="/weddings/{wedding_id}/hantaran", tags=["hantaran"])


@router.get("", response_model=List[HantaranOut])
def list_hantaran(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    return (
        db.query(HantaranItem)
        .filter(HantaranItem.wedding_id == wedding_id, HantaranItem.status == 1)
        .order_by(HantaranItem.side, HantaranItem.dulang_number, HantaranItem.sort_order)
        .all()
    )


@router.post("", response_model=HantaranOut, status_code=201)
def create_hantaran(
    wedding_id: str,
    payload: HantaranCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = HantaranItem(wedding_id=wedding_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=HantaranOut)
def update_hantaran(
    wedding_id: str,
    item_id: str,
    payload: HantaranUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(HantaranItem).filter(
        HantaranItem.id == item_id,
        HantaranItem.wedding_id == wedding_id,
        HantaranItem.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_hantaran(
    wedding_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(HantaranItem).filter(
        HantaranItem.id == item_id,
        HantaranItem.wedding_id == wedding_id,
        HantaranItem.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.status = 0
    db.commit()

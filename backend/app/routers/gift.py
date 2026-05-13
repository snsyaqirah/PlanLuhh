from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.core.security import encrypt_data, decrypt_data
from app.models.user import User
from app.models.gift import GiftRegistryItem, GiftReceived
from app.schemas.gift import (
    GiftRegistryItemCreate, GiftRegistryItemUpdate, GiftRegistryItemOut,
    GiftReceivedCreate, GiftReceivedUpdate, GiftReceivedOut,
)
from app.routers.wedding import _assert_access

router = APIRouter(tags=["gifts"])


def _decrypt_gift(g: GiftReceived) -> dict:
    d = {c.key: getattr(g, c.key) for c in g.__table__.columns}
    d["amount"] = decrypt_data(g.amount_encrypted) if g.amount_encrypted else None
    return d


# ─── Registry Items ───────────────────────────────────────────────────────────

@router.get("/weddings/{wedding_id}/gifts/registry", response_model=List[GiftRegistryItemOut])
def list_registry(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    return db.query(GiftRegistryItem).filter(
        GiftRegistryItem.wedding_id == wedding_id,
        GiftRegistryItem.status == 1,
    ).order_by(GiftRegistryItem.created_at).all()


@router.post("/weddings/{wedding_id}/gifts/registry", response_model=GiftRegistryItemOut, status_code=201)
def create_registry_item(
    wedding_id: str,
    payload: GiftRegistryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = GiftRegistryItem(wedding_id=wedding_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/weddings/{wedding_id}/gifts/registry/{item_id}", response_model=GiftRegistryItemOut)
def update_registry_item(
    wedding_id: str,
    item_id: str,
    payload: GiftRegistryItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(GiftRegistryItem).filter(GiftRegistryItem.id == item_id, GiftRegistryItem.wedding_id == wedding_id, GiftRegistryItem.status == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/weddings/{wedding_id}/gifts/registry/{item_id}", status_code=204)
def delete_registry_item(
    wedding_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(GiftRegistryItem).filter(GiftRegistryItem.id == item_id, GiftRegistryItem.wedding_id == wedding_id, GiftRegistryItem.status == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.status = 0
    db.commit()


# ─── Gifts Received ───────────────────────────────────────────────────────────

@router.get("/weddings/{wedding_id}/gifts/received")
def list_gifts_received(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    gifts = db.query(GiftReceived).filter(
        GiftReceived.wedding_id == wedding_id,
        GiftReceived.status == 1,
    ).order_by(GiftReceived.date_received.desc(), GiftReceived.created_at.desc()).all()
    return [_decrypt_gift(g) for g in gifts]


@router.post("/weddings/{wedding_id}/gifts/received", status_code=201)
def add_gift_received(
    wedding_id: str,
    payload: GiftReceivedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    data = payload.model_dump()
    amount_raw = data.pop("amount", None)
    gift = GiftReceived(
        wedding_id=wedding_id,
        amount_encrypted=encrypt_data(amount_raw) if amount_raw else None,
        **data,
    )
    db.add(gift)
    db.commit()
    db.refresh(gift)
    return _decrypt_gift(gift)


@router.patch("/weddings/{wedding_id}/gifts/received/{gift_id}")
def update_gift_received(
    wedding_id: str,
    gift_id: str,
    payload: GiftReceivedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    gift = db.query(GiftReceived).filter(GiftReceived.id == gift_id, GiftReceived.wedding_id == wedding_id, GiftReceived.status == 1).first()
    if not gift:
        raise HTTPException(status_code=404, detail="Gift not found")
    data = payload.model_dump(exclude_unset=True)
    if "amount" in data:
        gift.amount_encrypted = encrypt_data(data.pop("amount")) if data["amount"] else None
    for k, v in data.items():
        setattr(gift, k, v)
    db.commit()
    db.refresh(gift)
    return _decrypt_gift(gift)


@router.delete("/weddings/{wedding_id}/gifts/received/{gift_id}", status_code=204)
def delete_gift_received(
    wedding_id: str,
    gift_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    gift = db.query(GiftReceived).filter(GiftReceived.id == gift_id, GiftReceived.wedding_id == wedding_id, GiftReceived.status == 1).first()
    if not gift:
        raise HTTPException(status_code=404, detail="Gift not found")
    gift.status = 0
    db.commit()

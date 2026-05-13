from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.core.security import encrypt_data, decrypt_data
from app.models.user import User
from app.models.honeymoon import Honeymoon, HoneymoonItem
from app.schemas.honeymoon import (
    HoneymoonCreate, HoneymoonUpdate, HoneymoonOut,
    HoneymoonItemCreate, HoneymoonItemUpdate, HoneymoonItemOut,
)
from app.routers.wedding import _assert_access

router = APIRouter(tags=["honeymoon"])


def _decrypt_honeymoon(h: Honeymoon) -> dict:
    d = {c.key: getattr(h, c.key) for c in h.__table__.columns}
    d["budget_total"] = decrypt_data(h.budget_total_encrypted) if h.budget_total_encrypted else None
    return d


def _decrypt_item(i: HoneymoonItem) -> dict:
    d = {c.key: getattr(i, c.key) for c in i.__table__.columns}
    d["cost"] = decrypt_data(i.cost_encrypted) if i.cost_encrypted else None
    return d


def _get_honeymoon(db: Session, wedding_id: str) -> Honeymoon:
    h = db.query(Honeymoon).filter(Honeymoon.wedding_id == wedding_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Honeymoon not created yet")
    return h


# ─── Honeymoon (one per wedding) ─────────────────────────────────────────────

@router.get("/weddings/{wedding_id}/honeymoon")
def get_honeymoon(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    h = db.query(Honeymoon).filter(Honeymoon.wedding_id == wedding_id).first()
    if not h:
        return None
    return _decrypt_honeymoon(h)


@router.put("/weddings/{wedding_id}/honeymoon")
def upsert_honeymoon(
    wedding_id: str,
    payload: HoneymoonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    h = db.query(Honeymoon).filter(Honeymoon.wedding_id == wedding_id).first()
    data = payload.model_dump(exclude_none=True)
    budget_raw = data.pop("budget_total", None)
    if h is None:
        h = Honeymoon(
            wedding_id=wedding_id,
            budget_total_encrypted=encrypt_data(budget_raw) if budget_raw else None,
            **data,
        )
        db.add(h)
    else:
        for k, v in data.items():
            setattr(h, k, v)
        if budget_raw is not None:
            h.budget_total_encrypted = encrypt_data(budget_raw)
    db.commit()
    db.refresh(h)
    return _decrypt_honeymoon(h)


# ─── Honeymoon Items ──────────────────────────────────────────────────────────

@router.get("/weddings/{wedding_id}/honeymoon/items")
def list_items(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    h = _get_honeymoon(db, wedding_id)
    items = db.query(HoneymoonItem).filter(HoneymoonItem.honeymoon_id == h.id).order_by(HoneymoonItem.category, HoneymoonItem.created_at).all()
    return [_decrypt_item(i) for i in items]


@router.post("/weddings/{wedding_id}/honeymoon/items", status_code=201)
def add_item(
    wedding_id: str,
    payload: HoneymoonItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    h = _get_honeymoon(db, wedding_id)
    data = payload.model_dump()
    cost_raw = data.pop("cost", None)
    item = HoneymoonItem(
        honeymoon_id=h.id,
        cost_encrypted=encrypt_data(cost_raw) if cost_raw else None,
        **data,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _decrypt_item(item)


@router.patch("/weddings/{wedding_id}/honeymoon/items/{item_id}")
def update_item(
    wedding_id: str,
    item_id: str,
    payload: HoneymoonItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    h = _get_honeymoon(db, wedding_id)
    item = db.query(HoneymoonItem).filter(HoneymoonItem.id == item_id, HoneymoonItem.honeymoon_id == h.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    data = payload.model_dump(exclude_unset=True)
    if "cost" in data:
        item.cost_encrypted = encrypt_data(data.pop("cost")) if data["cost"] else None
    for k, v in data.items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return _decrypt_item(item)


@router.delete("/weddings/{wedding_id}/honeymoon/items/{item_id}", status_code=204)
def delete_item(
    wedding_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    h = _get_honeymoon(db, wedding_id)
    item = db.query(HoneymoonItem).filter(HoneymoonItem.id == item_id, HoneymoonItem.honeymoon_id == h.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()

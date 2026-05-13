from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.menu import MenuItem
from app.schemas.menu import MenuItemCreate, MenuItemUpdate, MenuItemOut
from app.routers.wedding import _assert_access

router = APIRouter(prefix="/weddings/{wedding_id}/menu", tags=["menu"])


@router.get("", response_model=List[MenuItemOut])
def list_menu(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    return (
        db.query(MenuItem)
        .filter(MenuItem.wedding_id == wedding_id, MenuItem.status == 1)
        .order_by(MenuItem.category, MenuItem.item_name)
        .all()
    )


@router.post("", response_model=MenuItemOut, status_code=201)
def create_menu_item(
    wedding_id: str,
    payload: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = MenuItem(wedding_id=wedding_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=MenuItemOut)
def update_menu_item(
    wedding_id: str,
    item_id: str,
    payload: MenuItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.wedding_id == wedding_id,
        MenuItem.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_menu_item(
    wedding_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.wedding_id == wedding_id,
        MenuItem.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.status = 0
    db.commit()

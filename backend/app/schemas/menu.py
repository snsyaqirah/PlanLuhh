from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.menu import MenuCategoryEnum


class MenuItemCreate(BaseModel):
    category: MenuCategoryEnum
    item_name: str
    is_vegetarian: bool = False
    is_halal: bool = True
    is_confirmed: bool = False
    notes: Optional[str] = None
    quantity: Optional[str] = None


class MenuItemUpdate(BaseModel):
    category: Optional[MenuCategoryEnum] = None
    item_name: Optional[str] = None
    is_vegetarian: Optional[bool] = None
    is_halal: Optional[bool] = None
    is_confirmed: Optional[bool] = None
    notes: Optional[str] = None
    quantity: Optional[str] = None


class MenuItemOut(BaseModel):
    id: UUID
    wedding_id: UUID
    category: MenuCategoryEnum
    item_name: str
    is_vegetarian: bool
    is_halal: bool
    is_confirmed: bool
    notes: Optional[str]
    quantity: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

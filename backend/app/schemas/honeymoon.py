from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from app.models.honeymoon import HoneymoonItemCategoryEnum


class HoneymoonCreate(BaseModel):
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    budget_total: Optional[str] = None  # plain value, encrypted in router


class HoneymoonUpdate(HoneymoonCreate):
    pass


class HoneymoonOut(BaseModel):
    id: UUID
    wedding_id: UUID
    destination: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    notes: Optional[str]
    budget_total: Optional[str]   # decrypted for display
    created_at: datetime

    model_config = {"from_attributes": True}


class HoneymoonItemCreate(BaseModel):
    category: HoneymoonItemCategoryEnum
    item_name: str
    is_booked: bool = False
    booking_reference: Optional[str] = None
    notes: Optional[str] = None
    cost: Optional[str] = None


class HoneymoonItemUpdate(BaseModel):
    category: Optional[HoneymoonItemCategoryEnum] = None
    item_name: Optional[str] = None
    is_booked: Optional[bool] = None
    booking_reference: Optional[str] = None
    notes: Optional[str] = None
    cost: Optional[str] = None


class HoneymoonItemOut(BaseModel):
    id: UUID
    honeymoon_id: UUID
    category: HoneymoonItemCategoryEnum
    item_name: str
    is_booked: bool
    booking_reference: Optional[str]
    notes: Optional[str]
    cost: Optional[str]           # decrypted for display
    created_at: datetime

    model_config = {"from_attributes": True}

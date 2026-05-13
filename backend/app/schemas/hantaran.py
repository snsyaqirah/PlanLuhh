from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from app.models.hantaran import HantaranSideEnum, HantaranCategoryEnum, HantaranStatusEnum


class HantaranCreate(BaseModel):
    side: HantaranSideEnum
    name: str
    category: HantaranCategoryEnum = HantaranCategoryEnum.LAIN_LAIN
    dulang_number: Optional[int] = None
    item_status: HantaranStatusEnum = HantaranStatusEnum.BELUM_BELI
    estimated_cost: Optional[Decimal] = None
    notes: Optional[str] = None
    sort_order: int = 0


class HantaranUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[HantaranCategoryEnum] = None
    dulang_number: Optional[int] = None
    item_status: Optional[HantaranStatusEnum] = None
    estimated_cost: Optional[Decimal] = None
    notes: Optional[str] = None
    sort_order: Optional[int] = None


class HantaranOut(BaseModel):
    id: UUID
    wedding_id: UUID
    side: HantaranSideEnum
    name: str
    category: HantaranCategoryEnum
    dulang_number: Optional[int]
    item_status: HantaranStatusEnum
    estimated_cost: Optional[Decimal]
    notes: Optional[str]
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}

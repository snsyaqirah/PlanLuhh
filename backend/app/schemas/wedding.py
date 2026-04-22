from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from app.models.wedding import WeddingThemeEnum


class WeddingCreate(BaseModel):
    groom_name: str
    bride_name: str
    groom_name_short: Optional[str] = None
    bride_name_short: Optional[str] = None
    wedding_date: Optional[date] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_lat: Optional[Decimal] = None
    venue_lng: Optional[Decimal] = None
    theme: Optional[WeddingThemeEnum] = WeddingThemeEnum.OTHER
    budget_total: Optional[Decimal] = Decimal("0")
    notes: Optional[str] = None


class WeddingUpdate(BaseModel):
    groom_name: Optional[str] = None
    bride_name: Optional[str] = None
    groom_name_short: Optional[str] = None
    bride_name_short: Optional[str] = None
    wedding_date: Optional[date] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_lat: Optional[Decimal] = None
    venue_lng: Optional[Decimal] = None
    theme: Optional[WeddingThemeEnum] = None
    budget_total: Optional[Decimal] = None
    notes: Optional[str] = None


class WeddingOut(BaseModel):
    id: UUID
    groom_name: str
    bride_name: str
    groom_name_short: Optional[str]
    bride_name_short: Optional[str]
    wedding_date: Optional[date]
    venue_name: Optional[str]
    venue_address: Optional[str]
    venue_lat: Optional[Decimal]
    venue_lng: Optional[Decimal]
    theme: Optional[WeddingThemeEnum]
    budget_total: Decimal
    cover_photo: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

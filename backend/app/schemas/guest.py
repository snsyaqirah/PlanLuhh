from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.guest import RSVPStatusEnum, GuestSideEnum, MealPreferenceEnum


class GuestCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    side: GuestSideEnum = GuestSideEnum.BOTH
    pax_count: int = 1
    meal_preference: Optional[MealPreferenceEnum] = MealPreferenceEnum.NORMAL
    allergies: Optional[str] = None
    notes: Optional[str] = None
    is_vip: bool = False
    table_id: Optional[UUID] = None


class GuestUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    side: Optional[GuestSideEnum] = None
    rsvp_status: Optional[RSVPStatusEnum] = None
    pax_count: Optional[int] = None
    meal_preference: Optional[MealPreferenceEnum] = None
    allergies: Optional[str] = None
    notes: Optional[str] = None
    is_vip: Optional[bool] = None
    table_id: Optional[UUID] = None


class GuestOut(BaseModel):
    id: UUID
    wedding_id: UUID
    name: str
    phone: Optional[str]
    email: Optional[str]
    side: GuestSideEnum
    rsvp_status: RSVPStatusEnum
    pax_count: int
    table_id: Optional[UUID]
    meal_preference: Optional[MealPreferenceEnum]
    allergies: Optional[str]
    notes: Optional[str]
    is_vip: bool
    created_at: datetime

    model_config = {"from_attributes": True}

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.moodboard import MoodboardCategoryEnum


class MoodboardCreate(BaseModel):
    category: MoodboardCategoryEnum
    title: Optional[str] = None
    image_url: Optional[str] = None
    color_hex: Optional[str] = None
    note: Optional[str] = None


class MoodboardUpdate(BaseModel):
    category: Optional[MoodboardCategoryEnum] = None
    title: Optional[str] = None
    image_url: Optional[str] = None
    color_hex: Optional[str] = None
    note: Optional[str] = None


class MoodboardOut(BaseModel):
    id: UUID
    wedding_id: UUID
    category: MoodboardCategoryEnum
    title: Optional[str]
    image_url: Optional[str]
    color_hex: Optional[str]
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

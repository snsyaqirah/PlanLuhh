from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, time
from app.models.rundown import MajlisEnum


class RundownCreate(BaseModel):
    majlis: MajlisEnum
    activity: str
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    pic: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int = 0


class RundownUpdate(BaseModel):
    activity: Optional[str] = None
    majlis: Optional[MajlisEnum] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    pic: Optional[str] = None
    notes: Optional[str] = None
    sort_order: Optional[int] = None


class RundownOut(BaseModel):
    id: UUID
    wedding_id: UUID
    majlis: MajlisEnum
    activity: str
    start_time: Optional[time]
    end_time: Optional[time]
    pic: Optional[str]
    notes: Optional[str]
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}

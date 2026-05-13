from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date, time
from app.models.schedule import ScheduleTypeEnum


class ScheduleCreate(BaseModel):
    event_name: str
    event_type: ScheduleTypeEnum = ScheduleTypeEnum.OTHER
    event_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    description: Optional[str] = None
    responsible_person: Optional[str] = None


class ScheduleUpdate(BaseModel):
    event_name: Optional[str] = None
    event_type: Optional[ScheduleTypeEnum] = None
    event_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    description: Optional[str] = None
    responsible_person: Optional[str] = None


class ScheduleOut(BaseModel):
    id: UUID
    wedding_id: UUID
    event_name: str
    event_type: ScheduleTypeEnum
    event_date: Optional[date]
    start_time: Optional[time]
    end_time: Optional[time]
    location: Optional[str]
    description: Optional[str]
    responsible_person: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

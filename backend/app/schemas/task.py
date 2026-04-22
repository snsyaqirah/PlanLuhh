from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from app.models.task import TaskPhaseEnum


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    phase: Optional[TaskPhaseEnum] = None
    due_date: Optional[date] = None
    sort_order: int = 0
    assigned_to: Optional[UUID] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    phase: Optional[TaskPhaseEnum] = None
    due_date: Optional[date] = None
    is_completed: Optional[bool] = None
    sort_order: Optional[int] = None
    assigned_to: Optional[UUID] = None


class TaskOut(BaseModel):
    id: UUID
    wedding_id: UUID
    title: str
    description: Optional[str]
    phase: Optional[TaskPhaseEnum]
    due_date: Optional[date]
    is_completed: bool
    sort_order: int
    assigned_to: Optional[UUID]
    created_at: datetime

    model_config = {"from_attributes": True}

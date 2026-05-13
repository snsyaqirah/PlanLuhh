from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class SeatingTableCreate(BaseModel):
    table_number: int
    table_name: Optional[str] = None
    capacity: int = 10


class SeatingTableUpdate(BaseModel):
    table_number: Optional[int] = None
    table_name: Optional[str] = None
    capacity: Optional[int] = None


class SeatingTableOut(BaseModel):
    id: UUID
    wedding_id: UUID
    table_number: int
    table_name: Optional[str]
    capacity: int
    created_at: datetime

    model_config = {"from_attributes": True}

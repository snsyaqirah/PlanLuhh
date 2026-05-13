from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from app.models.document_checklist import DocumentSideEnum


class DocumentItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    side: DocumentSideEnum = DocumentSideEnum.BOTH
    notes: Optional[str] = None
    expiry_date: Optional[date] = None
    reminder_note: Optional[str] = None
    is_preset: bool = False
    sort_order: int = 0


class DocumentItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    side: Optional[DocumentSideEnum] = None
    is_completed: Optional[bool] = None
    notes: Optional[str] = None
    expiry_date: Optional[date] = None
    reminder_note: Optional[str] = None
    sort_order: Optional[int] = None


class DocumentItemOut(BaseModel):
    id: UUID
    wedding_id: UUID
    title: str
    description: Optional[str]
    side: DocumentSideEnum
    is_completed: bool
    notes: Optional[str]
    expiry_date: Optional[date]
    reminder_note: Optional[str]
    is_preset: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

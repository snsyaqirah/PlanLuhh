from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from app.models.budget import BudgetCategoryEnum


class BudgetItemCreate(BaseModel):
    category: BudgetCategoryEnum
    item_name: str
    estimated_amount: Optional[str] = None   # plaintext, encrypted on save
    actual_amount: Optional[str] = None
    paid_amount: Optional[str] = None
    payment_due_date: Optional[date] = None
    notes: Optional[str] = None


class BudgetItemUpdate(BaseModel):
    category: Optional[BudgetCategoryEnum] = None
    item_name: Optional[str] = None
    estimated_amount: Optional[str] = None
    actual_amount: Optional[str] = None
    paid_amount: Optional[str] = None
    payment_due_date: Optional[date] = None
    notes: Optional[str] = None


class BudgetItemOut(BaseModel):
    id: UUID
    wedding_id: UUID
    category: BudgetCategoryEnum
    item_name: str
    estimated_amount: Optional[str]    # decrypted on return
    actual_amount: Optional[str]
    paid_amount: Optional[str]
    payment_due_date: Optional[date]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

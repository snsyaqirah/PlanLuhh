from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from app.models.vendor import VendorCategoryEnum, VendorStatusEnum


class VendorCreate(BaseModel):
    name: str
    category: VendorCategoryEnum
    phone: Optional[str] = None
    email: Optional[str] = None
    instagram: Optional[str] = None
    website: Optional[str] = None
    price: Optional[str] = None           # plaintext, encrypted on save
    deposit_paid: Optional[str] = None
    balance_due: Optional[str] = None
    payment_due_date: Optional[date] = None
    contract_signed: bool = False
    notes: Optional[str] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[VendorCategoryEnum] = None
    vendor_status: Optional[VendorStatusEnum] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    instagram: Optional[str] = None
    website: Optional[str] = None
    price: Optional[str] = None
    deposit_paid: Optional[str] = None
    balance_due: Optional[str] = None
    payment_due_date: Optional[date] = None
    contract_signed: Optional[bool] = None
    notes: Optional[str] = None


class VendorOut(BaseModel):
    id: UUID
    wedding_id: UUID
    name: str
    category: VendorCategoryEnum
    vendor_status: VendorStatusEnum
    phone: Optional[str]
    email: Optional[str]
    instagram: Optional[str]
    website: Optional[str]
    price: Optional[str]           # decrypted on return
    deposit_paid: Optional[str]
    balance_due: Optional[str]
    payment_due_date: Optional[date]
    contract_signed: bool
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class VendorReviewCreate(BaseModel):
    rating: int       # 1-5
    notes: Optional[str] = None
    would_recommend: bool = True


class VendorReviewOut(BaseModel):
    id: UUID
    vendor_id: UUID
    rating: int
    notes: Optional[str]
    would_recommend: bool
    created_at: datetime

    model_config = {"from_attributes": True}

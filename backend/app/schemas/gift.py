from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date


class GiftRegistryItemCreate(BaseModel):
    item_name: str
    item_link: Optional[str] = None
    target_quantity: int = 1
    is_visible: bool = True
    notes: Optional[str] = None


class GiftRegistryItemUpdate(BaseModel):
    item_name: Optional[str] = None
    item_link: Optional[str] = None
    target_quantity: Optional[int] = None
    is_visible: Optional[bool] = None
    notes: Optional[str] = None


class GiftRegistryItemOut(BaseModel):
    id: UUID
    wedding_id: UUID
    item_name: str
    item_link: Optional[str]
    target_quantity: int
    claimed_count: int
    is_visible: bool
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class GiftReceivedCreate(BaseModel):
    donor_name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[str] = None  # raw value, encrypted before storing
    gift_type: str = "PHYSICAL"   # PHYSICAL / CASH / EWALLET / REGISTRY_ITEM
    registry_item_id: Optional[UUID] = None
    thank_you_sent: bool = False
    notes: Optional[str] = None
    date_received: Optional[date] = None


class GiftReceivedUpdate(BaseModel):
    donor_name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[str] = None
    gift_type: Optional[str] = None
    registry_item_id: Optional[UUID] = None
    thank_you_sent: Optional[bool] = None
    notes: Optional[str] = None
    date_received: Optional[date] = None


class GiftReceivedOut(BaseModel):
    id: UUID
    wedding_id: UUID
    donor_name: Optional[str]
    description: Optional[str]
    amount: Optional[str]          # decrypted for display
    gift_type: str
    registry_item_id: Optional[UUID]
    thank_you_sent: bool
    notes: Optional[str]
    date_received: Optional[date]
    created_at: datetime

    model_config = {"from_attributes": True}

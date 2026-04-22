from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import UserStatusEnum


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str]
    phone: Optional[str]
    account_status: UserStatusEnum
    is_verified: bool
    profile_pic: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

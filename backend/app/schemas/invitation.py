from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.invitation import InvitationThemeEnum, LanguageEnum


class InvitationCreate(BaseModel):
    theme: InvitationThemeEnum = InvitationThemeEnum.CLASSIC
    language: LanguageEnum = LanguageEnum.DUAL
    show_love_story: bool = True
    show_meal_preference: bool = False
    show_gift_registry: bool = False
    show_dress_code: bool = True
    enable_rsvp: bool = True
    rsvp_max_pax: Optional[int] = None
    enable_countdown: bool = True
    enable_music: bool = False
    music_url: Optional[str] = None
    dress_code_description: Optional[str] = None
    dress_code_colors: Optional[str] = None
    gift_registry_url: Optional[str] = None
    duitnow_qr_url: Optional[str] = None
    custom_message: Optional[str] = None


class InvitationUpdate(InvitationCreate):
    pass


class InvitationOut(BaseModel):
    id: UUID
    wedding_id: UUID
    slug: UUID
    theme: InvitationThemeEnum
    language: LanguageEnum
    is_published: bool
    show_love_story: bool
    show_meal_preference: bool
    show_gift_registry: bool
    show_dress_code: bool
    enable_rsvp: bool
    rsvp_max_pax: Optional[int]
    enable_countdown: bool
    enable_music: bool
    music_url: Optional[str]
    dress_code_description: Optional[str]
    dress_code_colors: Optional[str]
    gift_registry_url: Optional[str]
    duitnow_qr_url: Optional[str]
    custom_message: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class LoveStoryCreate(BaseModel):
    year: Optional[str] = None
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int = 0


class LoveStoryOut(BaseModel):
    id: UUID
    invitation_id: UUID
    year: Optional[str]
    title: str
    description: Optional[str]
    image_url: Optional[str]
    sort_order: int

    model_config = {"from_attributes": True}


class ContactPersonCreate(BaseModel):
    name: str
    role: Optional[str] = None
    phone: str
    side: Optional[str] = None


class ContactPersonOut(BaseModel):
    id: UUID
    name: str
    role: Optional[str]
    phone: str
    side: Optional[str]

    model_config = {"from_attributes": True}


class GuestbookEntryCreate(BaseModel):
    guest_name: str
    message: str


class GuestbookEntryOut(BaseModel):
    id: UUID
    guest_name: str
    message: str
    is_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RSVPCreate(BaseModel):
    guest_name: str
    phone: Optional[str] = None
    response: str   # ATTENDING / NOT_ATTENDING / MAYBE
    pax_count: int = 1
    meal_preference: Optional[str] = None
    allergies: Optional[str] = None
    message: Optional[str] = None


class RSVPOut(BaseModel):
    id: UUID
    guest_name: str
    phone: Optional[str]
    response: str
    pax_count: int
    meal_preference: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class GalleryPhotoCreate(BaseModel):
    image_url: str
    caption: Optional[str] = None
    sort_order: int = 0


class GalleryPhotoOut(BaseModel):
    id: UUID
    image_url: str
    caption: Optional[str]
    sort_order: int

    model_config = {"from_attributes": True}

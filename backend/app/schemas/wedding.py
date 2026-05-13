from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date, time
from decimal import Decimal
from app.models.wedding import WeddingThemeEnum


class WeddingCreate(BaseModel):
    groom_name: str
    bride_name: str
    groom_name_short: Optional[str] = None
    bride_name_short: Optional[str] = None
    wedding_date: Optional[date] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_lat: Optional[Decimal] = None
    venue_lng: Optional[Decimal] = None
    theme: Optional[WeddingThemeEnum] = WeddingThemeEnum.OTHER
    budget_total: Optional[Decimal] = Decimal("0")
    notes: Optional[str] = None
    groom_father_name: Optional[str] = None
    groom_mother_name: Optional[str] = None
    bride_father_name: Optional[str] = None
    bride_mother_name: Optional[str] = None
    # Akad Nikah
    tarikh_nikah: Optional[date] = None
    waktu_nikah: Optional[time] = None
    venue_nikah: Optional[str] = None
    tema_warna_nikah: Optional[str] = None
    # Sanding Pihak Perempuan
    tarikh_sanding_perempuan: Optional[date] = None
    waktu_sanding_perempuan: Optional[time] = None
    venue_sanding_perempuan: Optional[str] = None
    # Sanding Pihak Lelaki
    tarikh_sanding_lelaki: Optional[date] = None
    waktu_sanding_lelaki: Optional[time] = None
    venue_sanding_lelaki: Optional[str] = None
    tema_warna_sanding: Optional[str] = None


class WeddingUpdate(BaseModel):
    groom_name: Optional[str] = None
    bride_name: Optional[str] = None
    groom_name_short: Optional[str] = None
    bride_name_short: Optional[str] = None
    wedding_date: Optional[date] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_lat: Optional[Decimal] = None
    venue_lng: Optional[Decimal] = None
    theme: Optional[WeddingThemeEnum] = None
    budget_total: Optional[Decimal] = None
    notes: Optional[str] = None
    groom_father_name: Optional[str] = None
    groom_mother_name: Optional[str] = None
    bride_father_name: Optional[str] = None
    bride_mother_name: Optional[str] = None
    # Akad Nikah
    tarikh_nikah: Optional[date] = None
    waktu_nikah: Optional[time] = None
    venue_nikah: Optional[str] = None
    tema_warna_nikah: Optional[str] = None
    # Sanding Pihak Perempuan
    tarikh_sanding_perempuan: Optional[date] = None
    waktu_sanding_perempuan: Optional[time] = None
    venue_sanding_perempuan: Optional[str] = None
    # Sanding Pihak Lelaki
    tarikh_sanding_lelaki: Optional[date] = None
    waktu_sanding_lelaki: Optional[time] = None
    venue_sanding_lelaki: Optional[str] = None
    tema_warna_sanding: Optional[str] = None


class WeddingOut(BaseModel):
    id: UUID
    groom_name: str
    bride_name: str
    groom_name_short: Optional[str]
    bride_name_short: Optional[str]
    wedding_date: Optional[date]
    venue_name: Optional[str]
    venue_address: Optional[str]
    venue_lat: Optional[Decimal]
    venue_lng: Optional[Decimal]
    theme: Optional[WeddingThemeEnum]
    budget_total: Decimal
    cover_photo: Optional[str]
    notes: Optional[str]
    groom_father_name: Optional[str]
    groom_mother_name: Optional[str]
    bride_father_name: Optional[str]
    bride_mother_name: Optional[str]
    # Akad Nikah
    tarikh_nikah: Optional[date]
    waktu_nikah: Optional[time]
    venue_nikah: Optional[str]
    tema_warna_nikah: Optional[str]
    # Sanding Pihak Perempuan
    tarikh_sanding_perempuan: Optional[date]
    waktu_sanding_perempuan: Optional[time]
    venue_sanding_perempuan: Optional[str]
    # Sanding Pihak Lelaki
    tarikh_sanding_lelaki: Optional[date]
    waktu_sanding_lelaki: Optional[time]
    venue_sanding_lelaki: Optional[str]
    tema_warna_sanding: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

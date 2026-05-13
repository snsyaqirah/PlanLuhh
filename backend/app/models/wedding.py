from sqlalchemy import Column, String, Date, Time, Numeric, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class WeddingThemeEnum(str, enum.Enum):
    GARDEN = "GARDEN"
    RUSTIC = "RUSTIC"
    MODERN = "MODERN"
    TRADITIONAL = "TRADITIONAL"
    BEACH = "BEACH"
    ROYAL = "ROYAL"
    MINIMALIST = "MINIMALIST"
    OTHER = "OTHER"


class Wedding(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "weddings"

    groom_name = Column(String(255), nullable=False)
    bride_name = Column(String(255), nullable=False)
    groom_name_short = Column(String(100), nullable=True)
    bride_name_short = Column(String(100), nullable=True)
    wedding_date = Column(Date, nullable=True)
    venue_name = Column(String(500), nullable=True)
    venue_address = Column(Text, nullable=True)
    venue_lat = Column(Numeric(10, 8), nullable=True)
    venue_lng = Column(Numeric(11, 8), nullable=True)
    theme = Column(SAEnum(WeddingThemeEnum), default=WeddingThemeEnum.OTHER, nullable=True)
    budget_total = Column(Numeric(12, 2), default=0, nullable=False)
    cover_photo = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    groom_father_name = Column(String(255), nullable=True)
    groom_mother_name = Column(String(255), nullable=True)
    bride_father_name = Column(String(255), nullable=True)
    bride_mother_name = Column(String(255), nullable=True)

    # Akad Nikah
    tarikh_nikah = Column(Date, nullable=True)
    waktu_nikah = Column(Time, nullable=True)
    venue_nikah = Column(String(500), nullable=True)
    tema_warna_nikah = Column(String(100), nullable=True)

    # Majlis Sanding Pihak Perempuan
    tarikh_sanding_perempuan = Column(Date, nullable=True)
    waktu_sanding_perempuan = Column(Time, nullable=True)
    venue_sanding_perempuan = Column(String(500), nullable=True)

    # Majlis Sanding Pihak Lelaki
    tarikh_sanding_lelaki = Column(Date, nullable=True)
    waktu_sanding_lelaki = Column(Time, nullable=True)
    venue_sanding_lelaki = Column(String(500), nullable=True)
    tema_warna_sanding = Column(String(100), nullable=True)

    # Relationships
    collaborators = relationship("WeddingCollaborator", back_populates="wedding", cascade="all, delete-orphan")
    guests = relationship("Guest", back_populates="wedding", cascade="all, delete-orphan")
    vendors = relationship("Vendor", back_populates="wedding", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="wedding", cascade="all, delete-orphan")
    budget_items = relationship("BudgetItem", back_populates="wedding", cascade="all, delete-orphan")
    event_schedules = relationship("EventSchedule", back_populates="wedding", cascade="all, delete-orphan")
    moodboards = relationship("Moodboard", back_populates="wedding", cascade="all, delete-orphan")
    menu_items = relationship("MenuItem", back_populates="wedding", cascade="all, delete-orphan")
    seating_tables = relationship("SeatingTable", back_populates="wedding", cascade="all, delete-orphan")
    invitation = relationship("Invitation", back_populates="wedding", uselist=False, cascade="all, delete-orphan")
    honeymoon = relationship("Honeymoon", back_populates="wedding", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="wedding")

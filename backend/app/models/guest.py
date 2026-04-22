from sqlalchemy import Column, String, Integer, Text, Enum as SAEnum, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class RSVPStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ATTENDING = "ATTENDING"
    NOT_ATTENDING = "NOT_ATTENDING"
    MAYBE = "MAYBE"


class GuestSideEnum(str, enum.Enum):
    GROOM = "GROOM"
    BRIDE = "BRIDE"
    BOTH = "BOTH"


class MealPreferenceEnum(str, enum.Enum):
    NORMAL = "NORMAL"
    VEGETARIAN = "VEGETARIAN"
    VEGAN = "VEGAN"
    HALAL = "HALAL"
    OTHER = "OTHER"


class Guest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "guests"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    side = Column(SAEnum(GuestSideEnum), default=GuestSideEnum.BOTH, nullable=False)
    rsvp_status = Column(SAEnum(RSVPStatusEnum), default=RSVPStatusEnum.PENDING, nullable=False, index=True)
    pax_count = Column(Integer, default=1, nullable=False)
    table_id = Column(UUID(as_uuid=True), ForeignKey("seating_tables.id", ondelete="SET NULL"), nullable=True)
    meal_preference = Column(SAEnum(MealPreferenceEnum), default=MealPreferenceEnum.NORMAL, nullable=True)
    allergies = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_vip = Column(Boolean, default=False, nullable=False)

    wedding = relationship("Wedding", back_populates="guests")
    table = relationship("SeatingTable", back_populates="guests")

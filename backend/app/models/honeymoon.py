from sqlalchemy import Column, String, Date, Text, Numeric, Boolean, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class HoneymoonItemCategoryEnum(str, enum.Enum):
    FLIGHT = "FLIGHT"
    HOTEL = "HOTEL"
    ACTIVITIES = "ACTIVITIES"
    FOOD = "FOOD"
    SHOPPING = "SHOPPING"
    TRANSPORT = "TRANSPORT"
    INSURANCE = "INSURANCE"
    OTHER = "OTHER"


class Honeymoon(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "honeymoons"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    destination = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    # Stored encrypted
    budget_total_encrypted = Column(Text, nullable=True)

    wedding = relationship("Wedding", back_populates="honeymoon")
    items = relationship("HoneymoonItem", back_populates="honeymoon", cascade="all, delete-orphan")


class HoneymoonItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "honeymoon_items"

    honeymoon_id = Column(UUID(as_uuid=True), ForeignKey("honeymoons.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(SAEnum(HoneymoonItemCategoryEnum), nullable=False, index=True)
    item_name = Column(String(255), nullable=False)
    is_booked = Column(Boolean, default=False, nullable=False)
    booking_reference = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    # Stored encrypted
    cost_encrypted = Column(Text, nullable=True)

    honeymoon = relationship("Honeymoon", back_populates="items")

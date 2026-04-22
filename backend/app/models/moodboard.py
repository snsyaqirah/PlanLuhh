from sqlalchemy import Column, String, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class MoodboardCategoryEnum(str, enum.Enum):
    COLORS = "COLORS"
    DECOR = "DECOR"
    FLOWERS = "FLOWERS"
    OUTFIT = "OUTFIT"
    VENUE = "VENUE"
    FOOD = "FOOD"
    INVITATION = "INVITATION"
    HAIR_MAKEUP = "HAIR_MAKEUP"
    OTHER = "OTHER"


class Moodboard(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "moodboards"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(SAEnum(MoodboardCategoryEnum), nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    color_hex = Column(String(7), nullable=True)  # e.g. #F5A623
    note = Column(Text, nullable=True)
    title = Column(String(255), nullable=True)

    wedding = relationship("Wedding", back_populates="moodboards")

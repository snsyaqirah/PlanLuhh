from sqlalchemy import Column, String, Time, Text, Integer, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class MajlisEnum(str, enum.Enum):
    AKAD_NIKAH = "AKAD_NIKAH"
    SANDING_PEREMPUAN = "SANDING_PEREMPUAN"
    SANDING_LELAKI = "SANDING_LELAKI"


class RundownEntry(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "rundown_entries"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    majlis = Column(SAEnum(MajlisEnum), nullable=False, index=True)
    activity = Column(String(500), nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    pic = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    wedding = relationship("Wedding", back_populates="rundown_entries")

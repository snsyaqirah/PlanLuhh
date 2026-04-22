from sqlalchemy import Column, String, Time, Date, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class ScheduleTypeEnum(str, enum.Enum):
    ENGAGEMENT = "ENGAGEMENT"
    REHEARSAL = "REHEARSAL"
    WEDDING_DAY = "WEDDING_DAY"
    POST_WEDDING = "POST_WEDDING"
    OTHER = "OTHER"


class EventSchedule(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "event_schedules"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(SAEnum(ScheduleTypeEnum), default=ScheduleTypeEnum.WEDDING_DAY, nullable=False, index=True)
    event_name = Column(String(255), nullable=False)
    event_date = Column(Date, nullable=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    location = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    responsible_person = Column(String(255), nullable=True)

    wedding = relationship("Wedding", back_populates="event_schedules")

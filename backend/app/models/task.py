from sqlalchemy import Column, String, Date, Text, Enum as SAEnum, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class TaskPhaseEnum(str, enum.Enum):
    PHASE_1_RESEARCH = "PHASE_1_RESEARCH"
    PHASE_2_BOOKING = "PHASE_2_BOOKING"
    PHASE_3_PREPARATION = "PHASE_3_PREPARATION"
    PHASE_4_FINAL = "PHASE_4_FINAL"
    BIG_DAY = "BIG_DAY"
    POST_WEDDING = "POST_WEDDING"


class Task(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "tasks"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    phase = Column(SAEnum(TaskPhaseEnum), nullable=True, index=True)
    due_date = Column(Date, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    sort_order = Column(Integer, default=0, nullable=False)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    wedding = relationship("Wedding", back_populates="tasks")

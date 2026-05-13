from sqlalchemy import Column, String, Boolean, Date, Text, Integer, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class DocumentSideEnum(str, enum.Enum):
    BOTH = "BOTH"
    GROOM = "GROOM"
    BRIDE = "BRIDE"


class DocumentChecklistItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "document_checklist_items"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    side = Column(SAEnum(DocumentSideEnum), default=DocumentSideEnum.BOTH, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    expiry_date = Column(Date, nullable=True)
    reminder_note = Column(String(255), nullable=True)
    is_preset = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    wedding = relationship("Wedding", back_populates="document_items")

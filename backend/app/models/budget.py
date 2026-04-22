from sqlalchemy import Column, String, Numeric, Date, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class BudgetCategoryEnum(str, enum.Enum):
    CATERING = "CATERING"
    PELAMIN = "PELAMIN"
    PHOTOGRAPHY = "PHOTOGRAPHY"
    VIDEOGRAPHY = "VIDEOGRAPHY"
    MAKEUP = "MAKEUP"
    ATTIRE = "ATTIRE"
    DECORATION = "DECORATION"
    INVITATION = "INVITATION"
    ENTERTAINMENT = "ENTERTAINMENT"
    TRANSPORTATION = "TRANSPORTATION"
    VENUE = "VENUE"
    HONEYMOON = "HONEYMOON"
    MISCELLANEOUS = "MISCELLANEOUS"


class BudgetItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "budget_items"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(SAEnum(BudgetCategoryEnum), nullable=False, index=True)
    item_name = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    payment_due_date = Column(Date, nullable=True)
    # Stored encrypted
    estimated_amount_encrypted = Column(Text, nullable=True)
    actual_amount_encrypted = Column(Text, nullable=True)
    paid_amount_encrypted = Column(Text, nullable=True)

    wedding = relationship("Wedding", back_populates="budget_items")

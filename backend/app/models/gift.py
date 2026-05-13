import enum
from sqlalchemy import Column, String, Integer, Text, Boolean, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class GiftTypeEnum(str, enum.Enum):
    PHYSICAL = "PHYSICAL"
    CASH = "CASH"
    EWALLET = "EWALLET"
    REGISTRY_ITEM = "REGISTRY_ITEM"


class GiftRegistryItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "gift_registry_items"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    item_name = Column(String(255), nullable=False)
    item_link = Column(String(500), nullable=True)
    target_quantity = Column(Integer, default=1, nullable=False)
    claimed_count = Column(Integer, default=0, nullable=False)
    is_visible = Column(Boolean, default=True, nullable=False)
    notes = Column(String(500), nullable=True)
    status = Column(Integer, default=1, nullable=False)

    wedding = relationship("Wedding", back_populates="gift_registry_items")
    gifts_received = relationship("GiftReceived", back_populates="registry_item")


class GiftReceived(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "gifts_received"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    donor_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    amount_encrypted = Column(Text, nullable=True)
    gift_type = Column(String(30), nullable=False, default=GiftTypeEnum.PHYSICAL)
    registry_item_id = Column(UUID(as_uuid=True), ForeignKey("gift_registry_items.id", ondelete="SET NULL"), nullable=True)
    thank_you_sent = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    date_received = Column(Date, nullable=True)
    status = Column(Integer, default=1, nullable=False)

    wedding = relationship("Wedding", back_populates="gifts_received")
    registry_item = relationship("GiftRegistryItem", back_populates="gifts_received")

from sqlalchemy import Column, String, Boolean, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class MenuCategoryEnum(str, enum.Enum):
    MAIN_COURSE = "MAIN_COURSE"
    SIDE_DISH = "SIDE_DISH"
    DESSERT = "DESSERT"
    BEVERAGE = "BEVERAGE"
    APPETIZER = "APPETIZER"
    OTHER = "OTHER"


class MenuItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "menu_items"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(SAEnum(MenuCategoryEnum), nullable=False, index=True)
    item_name = Column(String(255), nullable=False)
    is_vegetarian = Column(Boolean, default=False, nullable=False)
    is_halal = Column(Boolean, default=True, nullable=False)
    is_confirmed = Column(Boolean, default=False, nullable=False)
    notes = Column(String(500), nullable=True)
    quantity = Column(String(100), nullable=True)

    wedding = relationship("Wedding", back_populates="menu_items")

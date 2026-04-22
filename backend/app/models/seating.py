from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class SeatingTable(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "seating_tables"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    table_number = Column(Integer, nullable=False)
    table_name = Column(String(100), nullable=True)
    capacity = Column(Integer, default=10, nullable=False)

    wedding = relationship("Wedding", back_populates="seating_tables")
    guests = relationship("Guest", back_populates="table")

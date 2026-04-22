from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class AuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audit_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g. CREATE, UPDATE, DELETE
    entity_type = Column(String(100), nullable=True)           # e.g. guest, vendor, budget_item
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    old_value = Column(Text, nullable=True)  # JSON snapshot
    new_value = Column(Text, nullable=True)  # JSON snapshot
    ip_address = Column(String(45), nullable=True)

    user = relationship("User", back_populates="audit_logs")
    wedding = relationship("Wedding", back_populates="audit_logs")

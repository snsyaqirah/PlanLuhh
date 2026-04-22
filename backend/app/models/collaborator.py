from sqlalchemy import Column, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class CollaboratorRoleEnum(str, enum.Enum):
    GROOM = "GROOM"
    BRIDE = "BRIDE"
    ADMIN = "ADMIN"
    VIEWER = "VIEWER"


class WeddingCollaborator(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "wedding_collaborators"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(SAEnum(CollaboratorRoleEnum), default=CollaboratorRoleEnum.VIEWER, nullable=False)

    wedding = relationship("Wedding", back_populates="collaborators")
    user = relationship("User", back_populates="wedding_collaborations")

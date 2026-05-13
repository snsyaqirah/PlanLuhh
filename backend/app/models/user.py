from sqlalchemy import Column, String, Boolean, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class UserStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    SUSPENDED = "SUSPENDED"


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # null until after OTP verified
    full_name = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)
    account_status = Column(SAEnum(UserStatusEnum), default=UserStatusEnum.PENDING, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    profile_pic = Column(String(500), nullable=True)
    preferred_currency = Column(String(10), default="MYR", nullable=False)

    # Relationships
    otps = relationship("OTPVerification", back_populates="user", cascade="all, delete-orphan")
    wedding_collaborations = relationship("WeddingCollaborator", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

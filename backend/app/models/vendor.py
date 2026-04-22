from sqlalchemy import Column, String, Numeric, Text, Date, Integer, Enum as SAEnum, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class VendorCategoryEnum(str, enum.Enum):
    CATERING = "CATERING"
    PELAMIN = "PELAMIN"
    PHOTOGRAPHY = "PHOTOGRAPHY"
    VIDEOGRAPHY = "VIDEOGRAPHY"
    MAKEUP = "MAKEUP"
    ATTIRE = "ATTIRE"
    DECORATION = "DECORATION"
    ENTERTAINMENT = "ENTERTAINMENT"
    TRANSPORTATION = "TRANSPORTATION"
    VENUE = "VENUE"
    CAKE = "CAKE"
    FLORIST = "FLORIST"
    OTHER = "OTHER"


class VendorStatusEnum(str, enum.Enum):
    PROSPECT = "PROSPECT"
    CONTACTED = "CONTACTED"
    BOOKED = "BOOKED"
    DEPOSIT_PAID = "DEPOSIT_PAID"
    FULLY_PAID = "FULLY_PAID"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Vendor(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "vendors"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(SAEnum(VendorCategoryEnum), nullable=False, index=True)
    vendor_status = Column(SAEnum(VendorStatusEnum), default=VendorStatusEnum.PROSPECT, nullable=False)
    phone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    instagram = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    # Stored encrypted
    price_encrypted = Column(Text, nullable=True)
    deposit_paid_encrypted = Column(Text, nullable=True)
    balance_due_encrypted = Column(Text, nullable=True)
    payment_due_date = Column(Date, nullable=True)
    contract_signed = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)

    wedding = relationship("Wedding", back_populates="vendors")
    documents = relationship("VendorDocument", back_populates="vendor", cascade="all, delete-orphan")
    review = relationship("VendorReview", back_populates="vendor", uselist=False, cascade="all, delete-orphan")

from sqlalchemy import Column, String, Integer, Text, Enum as SAEnum, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class DocumentTypeEnum(str, enum.Enum):
    CONTRACT = "CONTRACT"
    INVOICE = "INVOICE"
    RECEIPT = "RECEIPT"
    OTHER = "OTHER"


class VendorDocument(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "vendor_documents"

    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    document_type = Column(SAEnum(DocumentTypeEnum), default=DocumentTypeEnum.OTHER, nullable=False)

    vendor = relationship("Vendor", back_populates="documents")


class VendorReview(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "vendor_reviews"

    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    notes = Column(Text, nullable=True)
    would_recommend = Column(Boolean, default=True, nullable=False)

    vendor = relationship("Vendor", back_populates="review")

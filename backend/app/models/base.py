import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, SmallInteger
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class TimestampMixin:
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    # status: 1 = active, 0 = soft deleted
    status = Column(SmallInteger, default=1, nullable=False, index=True)


class UUIDMixin:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

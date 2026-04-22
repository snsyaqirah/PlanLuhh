import uuid
from sqlalchemy import Column, String, Boolean, Text, Enum as SAEnum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class InvitationThemeEnum(str, enum.Enum):
    CLASSIC = "CLASSIC"
    MODERN = "MODERN"
    FLORAL = "FLORAL"
    MINIMALIST = "MINIMALIST"
    ROYAL = "ROYAL"


class LanguageEnum(str, enum.Enum):
    MS = "MS"
    EN = "EN"
    DUAL = "DUAL"


class Invitation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "invitations"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    # UUID-based public slug — safe for sharing
    slug = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False, index=True)
    theme = Column(SAEnum(InvitationThemeEnum), default=InvitationThemeEnum.CLASSIC, nullable=False)
    language = Column(SAEnum(LanguageEnum), default=LanguageEnum.DUAL, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)

    # Feature toggles
    show_love_story = Column(Boolean, default=True, nullable=False)
    show_meal_preference = Column(Boolean, default=False, nullable=False)
    show_gift_registry = Column(Boolean, default=False, nullable=False)
    show_dress_code = Column(Boolean, default=True, nullable=False)
    enable_rsvp = Column(Boolean, default=True, nullable=False)
    rsvp_max_pax = Column(Integer, nullable=True)  # null = unlimited
    enable_countdown = Column(Boolean, default=True, nullable=False)
    enable_music = Column(Boolean, default=False, nullable=False)

    # Content
    music_url = Column(String(500), nullable=True)
    dress_code_description = Column(Text, nullable=True)
    dress_code_colors = Column(Text, nullable=True)  # JSON string of hex colors
    gift_registry_url = Column(String(500), nullable=True)
    duitnow_qr_url = Column(String(500), nullable=True)
    custom_message = Column(Text, nullable=True)

    # Relationships
    wedding = relationship("Wedding", back_populates="invitation")
    love_story = relationship("LoveStory", back_populates="invitation", cascade="all, delete-orphan", order_by="LoveStory.sort_order")
    contact_persons = relationship("ContactPerson", back_populates="invitation", cascade="all, delete-orphan")
    guestbook_entries = relationship("GuestbookEntry", back_populates="invitation", cascade="all, delete-orphan")
    rsvp_responses = relationship("RSVPResponse", back_populates="invitation", cascade="all, delete-orphan")
    gallery_photos = relationship("GalleryPhoto", back_populates="invitation", cascade="all, delete-orphan")


class LoveStory(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "love_stories"

    invitation_id = Column(UUID(as_uuid=True), ForeignKey("invitations.id", ondelete="CASCADE"), nullable=False, index=True)
    year = Column(String(4), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    invitation = relationship("Invitation", back_populates="love_story")


class ContactPerson(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "contact_persons"

    invitation_id = Column(UUID(as_uuid=True), ForeignKey("invitations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=True)  # e.g. "Mother of Bride", "Best Man"
    phone = Column(String(30), nullable=False)
    side = Column(String(10), nullable=True)  # GROOM / BRIDE

    invitation = relationship("Invitation", back_populates="contact_persons")


class GuestbookEntry(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "guestbook_entries"

    invitation_id = Column(UUID(as_uuid=True), ForeignKey("invitations.id", ondelete="CASCADE"), nullable=False, index=True)
    guest_name = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=True, nullable=False)

    invitation = relationship("Invitation", back_populates="guestbook_entries")


class RSVPResponse(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "rsvp_responses"

    invitation_id = Column(UUID(as_uuid=True), ForeignKey("invitations.id", ondelete="CASCADE"), nullable=False, index=True)
    guest_name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    response = Column(SAEnum("ATTENDING", "NOT_ATTENDING", "MAYBE", name="rsvpresponseenum"), nullable=False)
    pax_count = Column(Integer, default=1, nullable=False)
    meal_preference = Column(String(50), nullable=True)
    allergies = Column(Text, nullable=True)
    message = Column(Text, nullable=True)

    invitation = relationship("Invitation", back_populates="rsvp_responses")


class GalleryPhoto(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "gallery_photos"

    invitation_id = Column(UUID(as_uuid=True), ForeignKey("invitations.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    caption = Column(String(255), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    invitation = relationship("Invitation", back_populates="gallery_photos")

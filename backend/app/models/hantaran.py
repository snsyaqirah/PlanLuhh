from sqlalchemy import Column, String, Text, Integer, Numeric, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class HantaranSideEnum(str, enum.Enum):
    LELAKI = "LELAKI"        # from groom side → to bride
    PEREMPUAN = "PEREMPUAN"  # from bride side → to groom


class HantaranCategoryEnum(str, enum.Enum):
    WANG_HANTARAN = "WANG_HANTARAN"
    MAS_KAHWIN = "MAS_KAHWIN"
    BARANG_KEMAS = "BARANG_KEMAS"
    PAKAIAN = "PAKAIAN"
    KOSMETIK = "KOSMETIK"
    MAKANAN = "MAKANAN"
    AKSESORI = "AKSESORI"
    LAIN_LAIN = "LAIN_LAIN"


class HantaranStatusEnum(str, enum.Enum):
    BELUM_BELI = "BELUM_BELI"
    DAH_BELI = "DAH_BELI"
    SUDAH_GUBAH = "SUDAH_GUBAH"
    SIAP = "SIAP"


class HantaranItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "hantaran_items"

    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    side = Column(SAEnum(HantaranSideEnum), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(SAEnum(HantaranCategoryEnum), default=HantaranCategoryEnum.LAIN_LAIN, nullable=False)
    dulang_number = Column(Integer, nullable=True)
    item_status = Column(SAEnum(HantaranStatusEnum), default=HantaranStatusEnum.BELUM_BELI, nullable=False)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    notes = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    wedding = relationship("Wedding", back_populates="hantaran_items")

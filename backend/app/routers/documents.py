from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.document_checklist import DocumentChecklistItem, DocumentSideEnum
from app.schemas.document_checklist import DocumentItemCreate, DocumentItemUpdate, DocumentItemOut
from app.routers.wedding import _assert_access

router = APIRouter(prefix="/weddings/{wedding_id}/documents", tags=["documents"])

PRESET_ITEMS = [
    # Both sides
    {"title": "Kursus Pra-Perkahwinan", "side": DocumentSideEnum.BOTH, "sort_order": 1},
    {"title": "Borang Nikah / Online BRIS", "side": DocumentSideEnum.BOTH, "sort_order": 2},
    {
        "title": "Ujian HIV",
        "side": DocumentSideEnum.BOTH,
        "sort_order": 3,
        "reminder_note": "Sah 6 bulan — pastikan tidak tamat tempoh sebelum tarikh nikah",
    },
    {"title": "Gambar Passport", "side": DocumentSideEnum.BOTH, "sort_order": 4},
    {"title": "Fotostat IC", "side": DocumentSideEnum.BOTH, "sort_order": 5},
    {"title": "Jumpa Kariah untuk Pengesahan", "side": DocumentSideEnum.BOTH, "sort_order": 6},
    {"title": "Hantar Borang ke Pejabat Agama", "side": DocumentSideEnum.BOTH, "sort_order": 7},
    {"title": "Tempah Jurunikah / Tok Kadi", "side": DocumentSideEnum.BOTH, "sort_order": 8},
    {"title": "Tentukan Tarikh & Waktu Nikah", "side": DocumentSideEnum.BOTH, "sort_order": 9},
    {"title": "Tentukan Lokasi Akad Nikah", "side": DocumentSideEnum.BOTH, "sort_order": 10},
    {
        "title": "Cincin",
        "side": DocumentSideEnum.BOTH,
        "sort_order": 11,
        "reminder_note": "Ingat tambah dalam Bajet → Barang Kemas",
    },
    {
        "title": "Upah Tok Kadi",
        "side": DocumentSideEnum.BOTH,
        "sort_order": 12,
        "reminder_note": "Ingat tambah dalam Bajet → Jurunikah",
    },
    {
        "title": "Upah Saksi",
        "side": DocumentSideEnum.BOTH,
        "sort_order": 13,
        "reminder_note": "Ingat tambah dalam Bajet → Jurunikah",
    },
    # Bride only
    {"title": "Kenal Pasti Wali", "side": DocumentSideEnum.BRIDE, "sort_order": 1},
    {"title": "2 Orang Saksi (Lelaki)", "side": DocumentSideEnum.BRIDE, "sort_order": 2},
    # Groom only
    {"title": "Mas Kahwin", "side": DocumentSideEnum.GROOM, "sort_order": 1},
    {"title": "Wang Hantaran (pilihan)", "side": DocumentSideEnum.GROOM, "sort_order": 2},
]


@router.get("", response_model=List[DocumentItemOut])
def list_documents(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    return (
        db.query(DocumentChecklistItem)
        .filter(
            DocumentChecklistItem.wedding_id == wedding_id,
            DocumentChecklistItem.status == 1,
        )
        .order_by(DocumentChecklistItem.side, DocumentChecklistItem.sort_order)
        .all()
    )


@router.post("/seed", response_model=List[DocumentItemOut], status_code=201)
def seed_documents(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    existing = (
        db.query(DocumentChecklistItem)
        .filter(
            DocumentChecklistItem.wedding_id == wedding_id,
            DocumentChecklistItem.is_preset == True,
        )
        .count()
    )
    if existing > 0:
        return (
            db.query(DocumentChecklistItem)
            .filter(
                DocumentChecklistItem.wedding_id == wedding_id,
                DocumentChecklistItem.status == 1,
            )
            .order_by(DocumentChecklistItem.side, DocumentChecklistItem.sort_order)
            .all()
        )

    items = []
    for preset in PRESET_ITEMS:
        item = DocumentChecklistItem(
            wedding_id=wedding_id,
            is_preset=True,
            **preset,
        )
        db.add(item)
        items.append(item)
    db.commit()
    for item in items:
        db.refresh(item)
    return items


@router.post("", response_model=DocumentItemOut, status_code=201)
def create_document(
    wedding_id: str,
    payload: DocumentItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = DocumentChecklistItem(wedding_id=wedding_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=DocumentItemOut)
def update_document(
    wedding_id: str,
    item_id: str,
    payload: DocumentItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(DocumentChecklistItem).filter(
        DocumentChecklistItem.id == item_id,
        DocumentChecklistItem.wedding_id == wedding_id,
        DocumentChecklistItem.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_document(
    wedding_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(DocumentChecklistItem).filter(
        DocumentChecklistItem.id == item_id,
        DocumentChecklistItem.wedding_id == wedding_id,
        DocumentChecklistItem.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.status = 0
    db.commit()

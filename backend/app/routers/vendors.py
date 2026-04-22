from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os, aiofiles

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.core.security import encrypt_data, decrypt_data
from app.core.config import settings
from app.models.user import User
from app.models.vendor import Vendor
from app.models.vendor_extras import VendorDocument, VendorReview, DocumentTypeEnum
from app.models.wedding import Wedding
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorOut, VendorReviewCreate, VendorReviewOut
from app.utils.audit import log_action
from app.routers.wedding import _assert_access

router = APIRouter(prefix="/weddings/{wedding_id}/vendors", tags=["vendors"])


def _get_wedding(wedding_id: str, db: Session, current_user: User) -> Wedding:
    _assert_access(db, wedding_id, current_user)
    wedding = db.query(Wedding).filter(Wedding.id == wedding_id, Wedding.status == 1).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    return wedding


def _decrypt_vendor(vendor: Vendor) -> dict:
    d = {c.name: getattr(vendor, c.name) for c in vendor.__table__.columns}
    d["price"] = decrypt_data(vendor.price_encrypted) if vendor.price_encrypted else None
    d["deposit_paid"] = decrypt_data(vendor.deposit_paid_encrypted) if vendor.deposit_paid_encrypted else None
    d["balance_due"] = decrypt_data(vendor.balance_due_encrypted) if vendor.balance_due_encrypted else None
    return d


@router.post("", response_model=VendorOut, status_code=201)
def add_vendor(
    wedding_id: str,
    payload: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    wedding = _get_wedding(wedding_id, db, current_user)
    data = payload.model_dump()
    vendor = Vendor(
        wedding_id=wedding.id,
        name=data["name"],
        category=data["category"],
        phone=data.get("phone"),
        email=data.get("email"),
        instagram=data.get("instagram"),
        website=data.get("website"),
        payment_due_date=data.get("payment_due_date"),
        contract_signed=data.get("contract_signed", False),
        notes=data.get("notes"),
        price_encrypted=encrypt_data(data["price"]) if data.get("price") else None,
        deposit_paid_encrypted=encrypt_data(data["deposit_paid"]) if data.get("deposit_paid") else None,
        balance_due_encrypted=encrypt_data(data["balance_due"]) if data.get("balance_due") else None,
    )
    db.add(vendor)
    log_action(db, "CREATE", user_id=current_user.id, wedding_id=wedding.id, entity_type="vendor", entity_id=vendor.id)
    db.commit()
    db.refresh(vendor)
    return _decrypt_vendor(vendor)


@router.get("", response_model=List[VendorOut])
def list_vendors(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _get_wedding(wedding_id, db, current_user)
    vendors = db.query(Vendor).filter(Vendor.wedding_id == wedding_id, Vendor.status == 1).all()
    return [_decrypt_vendor(v) for v in vendors]


@router.patch("/{vendor_id}", response_model=VendorOut)
def update_vendor(
    wedding_id: str,
    vendor_id: str,
    payload: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _get_wedding(wedding_id, db, current_user)
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.wedding_id == wedding_id, Vendor.status == 1).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    data = payload.model_dump(exclude_none=True)
    for k in ["price", "deposit_paid", "balance_due"]:
        if k in data:
            setattr(vendor, f"{k}_encrypted", encrypt_data(data.pop(k)))
    for k, v in data.items():
        setattr(vendor, k, v)
    log_action(db, "UPDATE", user_id=current_user.id, wedding_id=wedding_id, entity_type="vendor", entity_id=vendor.id)
    db.commit()
    db.refresh(vendor)
    return _decrypt_vendor(vendor)


@router.delete("/{vendor_id}", status_code=204)
def delete_vendor(
    wedding_id: str,
    vendor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _get_wedding(wedding_id, db, current_user)
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.wedding_id == wedding_id, Vendor.status == 1).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.status = 0
    log_action(db, "DELETE", user_id=current_user.id, wedding_id=wedding_id, entity_type="vendor", entity_id=vendor.id)
    db.commit()


@router.post("/{vendor_id}/documents", status_code=201)
async def upload_document(
    wedding_id: str,
    vendor_id: str,
    file: UploadFile = File(...),
    document_type: DocumentTypeEnum = DocumentTypeEnum.OTHER,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _get_wedding(wedding_id, db, current_user)
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.status == 1).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large (max {settings.MAX_FILE_SIZE_MB}MB)")

    upload_path = os.path.join(settings.UPLOAD_DIR, "vendors", str(vendor_id))
    os.makedirs(upload_path, exist_ok=True)
    safe_name = os.path.basename(file.filename or "upload")
    file_path = os.path.join(upload_path, safe_name)
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    doc = VendorDocument(
        vendor_id=vendor_id,
        document_name=safe_name,
        file_url=file_path,
        document_type=document_type,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"id": str(doc.id), "document_name": doc.document_name, "file_url": doc.file_url}


@router.post("/{vendor_id}/review", response_model=VendorReviewOut, status_code=201)
def upsert_review(
    wedding_id: str,
    vendor_id: str,
    payload: VendorReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _get_wedding(wedding_id, db, current_user)
    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(status_code=422, detail="Rating must be 1-5")
    review = db.query(VendorReview).filter(VendorReview.vendor_id == vendor_id).first()
    if review:
        review.rating = payload.rating
        review.notes = payload.notes
        review.would_recommend = payload.would_recommend
    else:
        review = VendorReview(vendor_id=vendor_id, **payload.model_dump())
        db.add(review)
    db.commit()
    db.refresh(review)
    return review

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.guest import Guest
from app.models.wedding import Wedding
from app.schemas.guest import GuestCreate, GuestUpdate, GuestOut
from app.utils.audit import log_action
from app.utils.export import generate_guest_pdf, generate_guest_excel
from app.routers.wedding import _assert_access

router = APIRouter(prefix="/weddings/{wedding_id}/guests", tags=["guests"])


def _get_wedding(wedding_id: str, db: Session, current_user: User) -> Wedding:
    _assert_access(db, wedding_id, current_user)
    wedding = db.query(Wedding).filter(Wedding.id == wedding_id, Wedding.status == 1).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    return wedding


@router.post("", response_model=GuestOut, status_code=201)
def add_guest(
    wedding_id: str,
    payload: GuestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    wedding = _get_wedding(wedding_id, db, current_user)
    guest = Guest(wedding_id=wedding.id, **payload.model_dump())
    db.add(guest)
    log_action(db, "CREATE", user_id=current_user.id, wedding_id=wedding.id, entity_type="guest", entity_id=guest.id)
    db.commit()
    db.refresh(guest)
    return guest


@router.get("", response_model=List[GuestOut])
def list_guests(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _get_wedding(wedding_id, db, current_user)
    return db.query(Guest).filter(Guest.wedding_id == wedding_id, Guest.status == 1).all()


@router.get("/{guest_id}", response_model=GuestOut)
def get_guest(
    wedding_id: str,
    guest_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _get_wedding(wedding_id, db, current_user)
    guest = db.query(Guest).filter(Guest.id == guest_id, Guest.wedding_id == wedding_id, Guest.status == 1).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest


@router.patch("/{guest_id}", response_model=GuestOut)
def update_guest(
    wedding_id: str,
    guest_id: str,
    payload: GuestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _get_wedding(wedding_id, db, current_user)
    guest = db.query(Guest).filter(Guest.id == guest_id, Guest.wedding_id == wedding_id, Guest.status == 1).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(guest, k, v)
    log_action(db, "UPDATE", user_id=current_user.id, wedding_id=wedding_id, entity_type="guest", entity_id=guest.id)
    db.commit()
    db.refresh(guest)
    return guest


@router.delete("/{guest_id}", status_code=204)
def delete_guest(
    wedding_id: str,
    guest_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _get_wedding(wedding_id, db, current_user)
    guest = db.query(Guest).filter(Guest.id == guest_id, Guest.wedding_id == wedding_id, Guest.status == 1).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    guest.status = 0
    log_action(db, "DELETE", user_id=current_user.id, wedding_id=wedding_id, entity_type="guest", entity_id=guest.id)
    db.commit()


@router.get("/export/pdf")
def export_guests_pdf(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    wedding = _get_wedding(wedding_id, db, current_user)
    guests = db.query(Guest).filter(Guest.wedding_id == wedding_id, Guest.status == 1).all()
    guest_dicts = [
        {
            "name": g.name, "phone": g.phone, "side": g.side.value,
            "rsvp_status": g.rsvp_status.value, "pax_count": g.pax_count,
            "table_number": "", "meal_preference": g.meal_preference.value if g.meal_preference else "",
        }
        for g in guests
    ]
    pdf_bytes = generate_guest_pdf(guest_dicts, f"{wedding.groom_name} & {wedding.bride_name}")
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=guest_list.pdf"},
    )


@router.get("/export/excel")
def export_guests_excel(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    wedding = _get_wedding(wedding_id, db, current_user)
    guests = db.query(Guest).filter(Guest.wedding_id == wedding_id, Guest.status == 1).all()
    guest_dicts = [
        {
            "name": g.name, "phone": g.phone, "email": g.email,
            "side": g.side.value, "rsvp_status": g.rsvp_status.value,
            "pax_count": g.pax_count, "table_number": "",
            "meal_preference": g.meal_preference.value if g.meal_preference else "",
            "allergies": g.allergies, "is_vip": g.is_vip, "notes": g.notes,
        }
        for g in guests
    ]
    excel_bytes = generate_guest_excel(guest_dicts, f"{wedding.groom_name} & {wedding.bride_name}")
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=guest_list.xlsx"},
    )

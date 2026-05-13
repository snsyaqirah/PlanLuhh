from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.invitation import (
    Invitation, LoveStory, ContactPerson, GuestbookEntry, RSVPResponse, GalleryPhoto
)
from app.models.wedding import Wedding
from app.schemas.invitation import (
    InvitationCreate, InvitationUpdate, InvitationOut,
    LoveStoryCreate, LoveStoryOut,
    ContactPersonCreate, ContactPersonOut,
    GuestbookEntryCreate, GuestbookEntryOut,
    RSVPCreate, RSVPOut,
    GalleryPhotoCreate, GalleryPhotoOut,
)
from app.routers.wedding import _assert_access

router = APIRouter(tags=["invitation"])


# ─── Admin: manage invitation ─────────────────────────────────────────────────

@router.post("/weddings/{wedding_id}/invitation", response_model=InvitationOut, status_code=201)
def create_invitation(
    wedding_id: str,
    payload: InvitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    existing = db.query(Invitation).filter(Invitation.wedding_id == wedding_id, Invitation.status == 1).first()
    if existing:
        raise HTTPException(status_code=409, detail="Invitation already exists")
    invitation = Invitation(wedding_id=wedding_id, **payload.model_dump())
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation


@router.get("/weddings/{wedding_id}/invitation", response_model=InvitationOut)
def get_invitation(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = db.query(Invitation).filter(Invitation.wedding_id == wedding_id, Invitation.status == 1).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return inv


@router.patch("/weddings/{wedding_id}/invitation", response_model=InvitationOut)
def update_invitation(
    wedding_id: str,
    payload: InvitationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = db.query(Invitation).filter(Invitation.wedding_id == wedding_id, Invitation.status == 1).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(inv, k, v)
    db.commit()
    db.refresh(inv)
    return inv


@router.post("/weddings/{wedding_id}/invitation/publish")
def toggle_publish(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = db.query(Invitation).filter(Invitation.wedding_id == wedding_id, Invitation.status == 1).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    inv.is_published = not inv.is_published
    db.commit()
    return {"is_published": inv.is_published, "slug": str(inv.slug)}


# ─── Love Story ───────────────────────────────────────────────────────────────

@router.post("/weddings/{wedding_id}/invitation/love-story", response_model=LoveStoryOut, status_code=201)
def add_love_story(
    wedding_id: str, payload: LoveStoryCreate,
    db: Session = Depends(get_db), current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    entry = LoveStory(invitation_id=inv.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/weddings/{wedding_id}/invitation/love-story", response_model=List[LoveStoryOut])
def list_love_story(
    wedding_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    return db.query(LoveStory).filter(LoveStory.invitation_id == inv.id, LoveStory.status == 1).order_by(LoveStory.sort_order).all()


@router.delete("/weddings/{wedding_id}/invitation/love-story/{entry_id}", status_code=204)
def delete_love_story(
    wedding_id: str, entry_id: str,
    db: Session = Depends(get_db), current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    e = db.query(LoveStory).filter(LoveStory.id == entry_id, LoveStory.invitation_id == inv.id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    e.status = 0
    db.commit()


# ─── Contact Persons ──────────────────────────────────────────────────────────

@router.post("/weddings/{wedding_id}/invitation/contacts", response_model=ContactPersonOut, status_code=201)
def add_contact(
    wedding_id: str, payload: ContactPersonCreate,
    db: Session = Depends(get_db), current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    contact = ContactPerson(invitation_id=inv.id, **payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("/weddings/{wedding_id}/invitation/contacts", response_model=List[ContactPersonOut])
def list_contacts(
    wedding_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    return db.query(ContactPerson).filter(ContactPerson.invitation_id == inv.id, ContactPerson.status == 1).all()


@router.delete("/weddings/{wedding_id}/invitation/contacts/{contact_id}", status_code=204)
def delete_contact(
    wedding_id: str, contact_id: str,
    db: Session = Depends(get_db), current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    c = db.query(ContactPerson).filter(ContactPerson.id == contact_id, ContactPerson.invitation_id == inv.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    c.status = 0
    db.commit()


# ─── Gallery ─────────────────────────────────────────────────────────────────

@router.post("/weddings/{wedding_id}/invitation/gallery", response_model=GalleryPhotoOut, status_code=201)
def add_gallery_photo(
    wedding_id: str, payload: GalleryPhotoCreate,
    db: Session = Depends(get_db), current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    photo = GalleryPhoto(invitation_id=inv.id, **payload.model_dump())
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.get("/weddings/{wedding_id}/invitation/gallery", response_model=List[GalleryPhotoOut])
def list_gallery(
    wedding_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    return db.query(GalleryPhoto).filter(GalleryPhoto.invitation_id == inv.id, GalleryPhoto.status == 1).order_by(GalleryPhoto.sort_order).all()


@router.delete("/weddings/{wedding_id}/invitation/gallery/{photo_id}", status_code=204)
def delete_gallery_photo(
    wedding_id: str, photo_id: str,
    db: Session = Depends(get_db), current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    p = db.query(GalleryPhoto).filter(GalleryPhoto.id == photo_id, GalleryPhoto.invitation_id == inv.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Photo not found")
    p.status = 0
    db.commit()


# ─── Admin: RSVP & Guestbook management ──────────────────────────────────────

@router.get("/weddings/{wedding_id}/invitation/rsvp", response_model=List[RSVPOut])
def list_rsvp(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    return db.query(RSVPResponse).filter(RSVPResponse.invitation_id == inv.id).order_by(RSVPResponse.created_at.desc()).all()


@router.get("/weddings/{wedding_id}/invitation/guestbook", response_model=List[GuestbookEntryOut])
def list_guestbook_admin(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    return db.query(GuestbookEntry).filter(
        GuestbookEntry.invitation_id == inv.id,
        GuestbookEntry.status == 1,
    ).order_by(GuestbookEntry.created_at.desc()).all()


@router.patch("/weddings/{wedding_id}/invitation/guestbook/{entry_id}/approve")
def approve_guestbook(
    wedding_id: str, entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    e = db.query(GuestbookEntry).filter(GuestbookEntry.id == entry_id, GuestbookEntry.invitation_id == inv.id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    e.is_approved = not e.is_approved
    db.commit()
    return {"is_approved": e.is_approved}


@router.delete("/weddings/{wedding_id}/invitation/guestbook/{entry_id}", status_code=204)
def delete_guestbook(
    wedding_id: str, entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    inv = _get_inv(db, wedding_id)
    e = db.query(GuestbookEntry).filter(GuestbookEntry.id == entry_id, GuestbookEntry.invitation_id == inv.id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    e.status = 0
    db.commit()


# ─── Public endpoints (no auth) ───────────────────────────────────────────────

@router.get("/i/{slug}", tags=["public"])
def view_invitation_public(slug: str, db: Session = Depends(get_db)):
    inv = db.query(Invitation).filter(Invitation.slug == slug, Invitation.is_published == True, Invitation.status == 1).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    wedding = db.query(Wedding).filter(Wedding.id == inv.wedding_id).first()
    return {
        "invitation": inv,
        "wedding": wedding,
        "love_story": db.query(LoveStory).filter(LoveStory.invitation_id == inv.id, LoveStory.status == 1).order_by(LoveStory.sort_order).all() if inv.show_love_story else [],
        "contacts": db.query(ContactPerson).filter(ContactPerson.invitation_id == inv.id, ContactPerson.status == 1).all(),
        "gallery": db.query(GalleryPhoto).filter(GalleryPhoto.invitation_id == inv.id, GalleryPhoto.status == 1).order_by(GalleryPhoto.sort_order).all(),
    }


@router.post("/i/{slug}/rsvp", response_model=RSVPOut, status_code=201, tags=["public"])
def submit_rsvp(slug: str, payload: RSVPCreate, db: Session = Depends(get_db)):
    inv = db.query(Invitation).filter(Invitation.slug == slug, Invitation.is_published == True, Invitation.status == 1).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if not inv.enable_rsvp:
        raise HTTPException(status_code=403, detail="RSVP is closed")
    if inv.rsvp_max_pax:
        total_pax = db.query(RSVPResponse).filter(
            RSVPResponse.invitation_id == inv.id,
            RSVPResponse.response == "ATTENDING",
        ).with_entities(RSVPResponse.pax_count).all()
        current_total = sum(r[0] for r in total_pax)
        if current_total + payload.pax_count > inv.rsvp_max_pax:
            raise HTTPException(status_code=400, detail="RSVP pax limit reached")
    rsvp = RSVPResponse(invitation_id=inv.id, **payload.model_dump())
    db.add(rsvp)
    db.commit()
    db.refresh(rsvp)
    return rsvp


@router.post("/i/{slug}/guestbook", response_model=GuestbookEntryOut, status_code=201, tags=["public"])
def submit_guestbook(slug: str, payload: GuestbookEntryCreate, db: Session = Depends(get_db)):
    inv = db.query(Invitation).filter(Invitation.slug == slug, Invitation.is_published == True, Invitation.status == 1).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    entry = GuestbookEntry(invitation_id=inv.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/i/{slug}/guestbook", response_model=List[GuestbookEntryOut], tags=["public"])
def get_guestbook(slug: str, db: Session = Depends(get_db)):
    inv = db.query(Invitation).filter(Invitation.slug == slug, Invitation.is_published == True, Invitation.status == 1).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return db.query(GuestbookEntry).filter(
        GuestbookEntry.invitation_id == inv.id,
        GuestbookEntry.is_approved == True,
        GuestbookEntry.status == 1,
    ).order_by(GuestbookEntry.created_at.desc()).all()


def _get_inv(db: Session, wedding_id: str) -> Invitation:
    inv = db.query(Invitation).filter(Invitation.wedding_id == wedding_id, Invitation.status == 1).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not created yet")
    return inv

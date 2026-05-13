from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.schedule import EventSchedule
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate, ScheduleOut
from app.routers.wedding import _assert_access

router = APIRouter(prefix="/weddings/{wedding_id}/schedule", tags=["schedule"])


@router.get("", response_model=List[ScheduleOut])
def list_schedule(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    return (
        db.query(EventSchedule)
        .filter(EventSchedule.wedding_id == wedding_id, EventSchedule.status == 1)
        .order_by(EventSchedule.event_date, EventSchedule.start_time)
        .all()
    )


@router.post("", response_model=ScheduleOut, status_code=201)
def create_schedule(
    wedding_id: str,
    payload: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = EventSchedule(wedding_id=wedding_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ScheduleOut)
def update_schedule(
    wedding_id: str,
    item_id: str,
    payload: ScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(EventSchedule).filter(
        EventSchedule.id == item_id,
        EventSchedule.wedding_id == wedding_id,
        EventSchedule.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_schedule(
    wedding_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(EventSchedule).filter(
        EventSchedule.id == item_id,
        EventSchedule.wedding_id == wedding_id,
        EventSchedule.status == 1,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    item.status = 0
    db.commit()

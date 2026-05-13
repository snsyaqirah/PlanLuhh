from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.rundown import RundownEntry
from app.schemas.rundown import RundownCreate, RundownUpdate, RundownOut
from app.routers.wedding import _assert_access

router = APIRouter(prefix="/weddings/{wedding_id}/rundown", tags=["rundown"])


@router.get("", response_model=List[RundownOut])
def list_rundown(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    return (
        db.query(RundownEntry)
        .filter(RundownEntry.wedding_id == wedding_id, RundownEntry.status == 1)
        .order_by(RundownEntry.majlis, RundownEntry.sort_order, RundownEntry.start_time)
        .all()
    )


@router.post("", response_model=RundownOut, status_code=201)
def create_rundown(
    wedding_id: str,
    payload: RundownCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    entry = RundownEntry(wedding_id=wedding_id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/{entry_id}", response_model=RundownOut)
def update_rundown(
    wedding_id: str,
    entry_id: str,
    payload: RundownUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    entry = db.query(RundownEntry).filter(
        RundownEntry.id == entry_id,
        RundownEntry.wedding_id == wedding_id,
        RundownEntry.status == 1,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_rundown(
    wedding_id: str,
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    entry = db.query(RundownEntry).filter(
        RundownEntry.id == entry_id,
        RundownEntry.wedding_id == wedding_id,
        RundownEntry.status == 1,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry.status = 0
    db.commit()

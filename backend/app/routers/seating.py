from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.seating import SeatingTable
from app.models.guest import Guest
from app.schemas.seating import SeatingTableCreate, SeatingTableUpdate, SeatingTableOut
from app.routers.wedding import _assert_access

router = APIRouter(tags=["seating"])


@router.get("/weddings/{wedding_id}/seating-tables", response_model=List[SeatingTableOut])
def list_tables(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    return db.query(SeatingTable).filter(SeatingTable.wedding_id == wedding_id).order_by(SeatingTable.table_number).all()


@router.post("/weddings/{wedding_id}/seating-tables", response_model=SeatingTableOut, status_code=201)
def create_table(
    wedding_id: str,
    payload: SeatingTableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    existing = db.query(SeatingTable).filter(
        SeatingTable.wedding_id == wedding_id,
        SeatingTable.table_number == payload.table_number,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Table number already exists")
    table = SeatingTable(wedding_id=wedding_id, **payload.model_dump())
    db.add(table)
    db.commit()
    db.refresh(table)
    return table


@router.patch("/weddings/{wedding_id}/seating-tables/{table_id}", response_model=SeatingTableOut)
def update_table(
    wedding_id: str,
    table_id: str,
    payload: SeatingTableUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    table = db.query(SeatingTable).filter(SeatingTable.id == table_id, SeatingTable.wedding_id == wedding_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(table, k, v)
    db.commit()
    db.refresh(table)
    return table


@router.delete("/weddings/{wedding_id}/seating-tables/{table_id}", status_code=204)
def delete_table(
    wedding_id: str,
    table_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    table = db.query(SeatingTable).filter(SeatingTable.id == table_id, SeatingTable.wedding_id == wedding_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    # unassign all guests from this table before deleting
    db.query(Guest).filter(Guest.table_id == table.id).update({"table_id": None})
    db.delete(table)
    db.commit()


@router.patch("/weddings/{wedding_id}/guests/{guest_id}/assign-table", status_code=200)
def assign_guest_table(
    wedding_id: str,
    guest_id: str,
    table_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    guest = db.query(Guest).filter(Guest.id == guest_id, Guest.wedding_id == wedding_id, Guest.status == 1).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    if table_id:
        table = db.query(SeatingTable).filter(SeatingTable.id == table_id, SeatingTable.wedding_id == wedding_id).first()
        if not table:
            raise HTTPException(status_code=404, detail="Table not found")
        guest.table_id = table.id
    else:
        guest.table_id = None
    db.commit()
    return {"guest_id": str(guest.id), "table_id": str(guest.table_id) if guest.table_id else None}

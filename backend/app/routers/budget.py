from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.core.security import encrypt_data, decrypt_data
from app.models.user import User
from app.models.budget import BudgetItem
from app.schemas.budget import BudgetItemCreate, BudgetItemUpdate, BudgetItemOut
from app.utils.audit import log_action
from app.utils.export import generate_budget_pdf, generate_budget_excel
from app.routers.wedding import _assert_access
from app.models.wedding import Wedding

router = APIRouter(prefix="/weddings/{wedding_id}/budget", tags=["budget"])


def _decrypt_item(item: BudgetItem) -> dict:
    d = {c.name: getattr(item, c.name) for c in item.__table__.columns}
    d["estimated_amount"] = decrypt_data(item.estimated_amount_encrypted) if item.estimated_amount_encrypted else None
    d["actual_amount"] = decrypt_data(item.actual_amount_encrypted) if item.actual_amount_encrypted else None
    d["paid_amount"] = decrypt_data(item.paid_amount_encrypted) if item.paid_amount_encrypted else None
    return d


@router.post("", response_model=BudgetItemOut, status_code=201)
def add_budget_item(
    wedding_id: str,
    payload: BudgetItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    data = payload.model_dump()
    item = BudgetItem(
        wedding_id=wedding_id,
        category=data["category"],
        item_name=data["item_name"],
        notes=data.get("notes"),
        payment_due_date=data.get("payment_due_date"),
        estimated_amount_encrypted=encrypt_data(data["estimated_amount"]) if data.get("estimated_amount") else None,
        actual_amount_encrypted=encrypt_data(data["actual_amount"]) if data.get("actual_amount") else None,
        paid_amount_encrypted=encrypt_data(data["paid_amount"]) if data.get("paid_amount") else None,
    )
    db.add(item)
    log_action(db, "CREATE", user_id=current_user.id, wedding_id=wedding_id, entity_type="budget_item", entity_id=item.id)
    db.commit()
    db.refresh(item)
    return _decrypt_item(item)


@router.get("", response_model=List[BudgetItemOut])
def list_budget_items(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    items = db.query(BudgetItem).filter(BudgetItem.wedding_id == wedding_id, BudgetItem.status == 1).all()
    return [_decrypt_item(i) for i in items]


@router.patch("/{item_id}", response_model=BudgetItemOut)
def update_budget_item(
    wedding_id: str,
    item_id: str,
    payload: BudgetItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(BudgetItem).filter(BudgetItem.id == item_id, BudgetItem.wedding_id == wedding_id, BudgetItem.status == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Budget item not found")
    data = payload.model_dump(exclude_none=True)
    for k in ["estimated_amount", "actual_amount", "paid_amount"]:
        if k in data:
            setattr(item, f"{k}_encrypted", encrypt_data(data.pop(k)))
    for k, v in data.items():
        setattr(item, k, v)
    log_action(db, "UPDATE", user_id=current_user.id, wedding_id=wedding_id, entity_type="budget_item", entity_id=item.id)
    db.commit()
    db.refresh(item)
    return _decrypt_item(item)


@router.delete("/{item_id}", status_code=204)
def delete_budget_item(
    wedding_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    item = db.query(BudgetItem).filter(BudgetItem.id == item_id, BudgetItem.wedding_id == wedding_id, BudgetItem.status == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Budget item not found")
    item.status = 0
    db.commit()


@router.get("/export/pdf")
def export_budget_pdf(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
    items = db.query(BudgetItem).filter(BudgetItem.wedding_id == wedding_id, BudgetItem.status == 1).all()
    item_dicts = [_decrypt_item(i) for i in items]
    pdf = generate_budget_pdf(item_dicts, f"{wedding.groom_name} & {wedding.bride_name}")
    return StreamingResponse(
        io.BytesIO(pdf),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=budget.pdf"},
    )


@router.get("/export/excel")
def export_budget_excel(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
    items = db.query(BudgetItem).filter(BudgetItem.wedding_id == wedding_id, BudgetItem.status == 1).all()
    item_dicts = [_decrypt_item(i) for i in items]
    xl = generate_budget_excel(item_dicts, f"{wedding.groom_name} & {wedding.bride_name}")
    return StreamingResponse(
        io.BytesIO(xl),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=budget.xlsx"},
    )

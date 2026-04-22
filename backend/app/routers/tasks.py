from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_verified_user
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut
from app.utils.audit import log_action
from app.routers.wedding import _assert_access

router = APIRouter(prefix="/weddings/{wedding_id}/tasks", tags=["tasks"])


@router.post("", response_model=TaskOut, status_code=201)
def create_task(
    wedding_id: str,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    task = Task(wedding_id=wedding_id, **payload.model_dump())
    db.add(task)
    log_action(db, "CREATE", user_id=current_user.id, wedding_id=wedding_id, entity_type="task", entity_id=task.id)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=List[TaskOut])
def list_tasks(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    return db.query(Task).filter(Task.wedding_id == wedding_id, Task.status == 1).order_by(Task.sort_order).all()


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    wedding_id: str,
    task_id: str,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    task = db.query(Task).filter(Task.id == task_id, Task.wedding_id == wedding_id, Task.status == 1).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    wedding_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    task = db.query(Task).filter(Task.id == task_id, Task.wedding_id == wedding_id, Task.status == 1).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = 0
    log_action(db, "DELETE", user_id=current_user.id, wedding_id=wedding_id, entity_type="task", entity_id=task.id)
    db.commit()

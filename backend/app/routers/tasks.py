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

from app.models.task import TaskPhaseEnum

PRESET_TASKS = [
    # Phase 1 — Research
    {"title": "Tentukan tarikh nikah & sanding", "phase": TaskPhaseEnum.PHASE_1_RESEARCH, "sort_order": 1},
    {"title": "Tentukan tema warna / konsep majlis", "phase": TaskPhaseEnum.PHASE_1_RESEARCH, "sort_order": 2},
    {"title": "Tentukan bajet keseluruhan", "phase": TaskPhaseEnum.PHASE_1_RESEARCH, "sort_order": 3},
    {"title": "Tentukan anggaran bilangan jemputan", "phase": TaskPhaseEnum.PHASE_1_RESEARCH, "sort_order": 4},
    {"title": "Tempah venue / dewan", "phase": TaskPhaseEnum.PHASE_1_RESEARCH, "sort_order": 5},
    {"title": "Tempah photographer & videographer", "phase": TaskPhaseEnum.PHASE_1_RESEARCH, "sort_order": 6},
    {"title": "Buat senarai jemputan awal", "phase": TaskPhaseEnum.PHASE_1_RESEARCH, "sort_order": 7},
    # Phase 2 — Booking
    {"title": "Tempah Tok Kadi / Jurunikah", "phase": TaskPhaseEnum.PHASE_2_BOOKING, "sort_order": 1},
    {"title": "Tempah MUA (Nikah & Sanding)", "phase": TaskPhaseEnum.PHASE_2_BOOKING, "sort_order": 2},
    {"title": "Tempah baju pengantin", "phase": TaskPhaseEnum.PHASE_2_BOOKING, "sort_order": 3},
    {"title": "Tempah caterer / penyedia makanan", "phase": TaskPhaseEnum.PHASE_2_BOOKING, "sort_order": 4},
    {"title": "Tentukan & tempah pelamin", "phase": TaskPhaseEnum.PHASE_2_BOOKING, "sort_order": 5},
    {"title": "Hantar borang ke Pejabat Agama", "phase": TaskPhaseEnum.PHASE_2_BOOKING, "sort_order": 6},
    {"title": "Tempah penginapan untuk ahli keluarga", "phase": TaskPhaseEnum.PHASE_2_BOOKING, "sort_order": 7},
    # Phase 3 — Preparation
    {"title": "Kursus Pra-Perkahwinan", "phase": TaskPhaseEnum.PHASE_3_PREPARATION, "sort_order": 1},
    {"title": "Beli & siapkan barang hantaran", "phase": TaskPhaseEnum.PHASE_3_PREPARATION, "sort_order": 2},
    {"title": "Beli cincin perkahwinan", "phase": TaskPhaseEnum.PHASE_3_PREPARATION, "sort_order": 3},
    {"title": "Fitting baju pengantin", "phase": TaskPhaseEnum.PHASE_3_PREPARATION, "sort_order": 4},
    {"title": "Tempah kad jemputan / e-invitation", "phase": TaskPhaseEnum.PHASE_3_PREPARATION, "sort_order": 5},
    {"title": "Tempah doorgift / bunga telur", "phase": TaskPhaseEnum.PHASE_3_PREPARATION, "sort_order": 6},
    {"title": "Susun aturcara majlis (rundown)", "phase": TaskPhaseEnum.PHASE_3_PREPARATION, "sort_order": 7},
    # Phase 4 — Final
    {"title": "Ujian HIV (pastikan dalam tempoh 6 bulan)", "phase": TaskPhaseEnum.PHASE_4_FINAL, "sort_order": 1},
    {"title": "Cuba baju pengantin — fitting akhir", "phase": TaskPhaseEnum.PHASE_4_FINAL, "sort_order": 2},
    {"title": "Pengesahan dengan semua vendor", "phase": TaskPhaseEnum.PHASE_4_FINAL, "sort_order": 3},
    {"title": "Siapkan bayaran akhir vendor", "phase": TaskPhaseEnum.PHASE_4_FINAL, "sort_order": 4},
    {"title": "Briefing keluarga & rakan tentang peranan", "phase": TaskPhaseEnum.PHASE_4_FINAL, "sort_order": 5},
    {"title": "Susun tempat duduk tetamu (seating)", "phase": TaskPhaseEnum.PHASE_4_FINAL, "sort_order": 6},
    # Big Day
    {"title": "Semak semua vendor tiba & bersedia", "phase": TaskPhaseEnum.BIG_DAY, "sort_order": 1},
    {"title": "Pastikan MC / Pengacara bersedia", "phase": TaskPhaseEnum.BIG_DAY, "sort_order": 2},
    {"title": "Semak semua dokumen akad nikah", "phase": TaskPhaseEnum.BIG_DAY, "sort_order": 3},
    # Post-Wedding
    {"title": "Hantar ucapan terima kasih kepada vendor", "phase": TaskPhaseEnum.POST_WEDDING, "sort_order": 1},
    {"title": "Collect gambar & video dari photographer", "phase": TaskPhaseEnum.POST_WEDDING, "sort_order": 2},
    {"title": "Kemas kini senarai hadiah diterima", "phase": TaskPhaseEnum.POST_WEDDING, "sort_order": 3},
    {"title": "Honeymoon! 🎉", "phase": TaskPhaseEnum.POST_WEDDING, "sort_order": 4},
]


@router.post("/seed", response_model=List[TaskOut], status_code=201)
def seed_tasks(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_verified_user),
):
    _assert_access(db, wedding_id, current_user)
    existing = db.query(Task).filter(Task.wedding_id == wedding_id).count()
    if existing > 0:
        return db.query(Task).filter(Task.wedding_id == wedding_id, Task.status == 1).order_by(Task.phase, Task.sort_order).all()
    tasks = []
    for preset in PRESET_TASKS:
        t = Task(wedding_id=wedding_id, **preset)
        db.add(t)
        tasks.append(t)
    db.commit()
    for t in tasks:
        db.refresh(t)
    return tasks


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

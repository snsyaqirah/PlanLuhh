import json
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    action: str,
    user_id: Optional[UUID] = None,
    wedding_id: Optional[UUID] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[UUID] = None,
    old_value: Optional[dict] = None,
    new_value: Optional[dict] = None,
    ip_address: Optional[str] = None,
) -> None:
    entry = AuditLog(
        user_id=user_id,
        wedding_id=wedding_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=json.dumps(old_value, default=str) if old_value else None,
        new_value=json.dumps(new_value, default=str) if new_value else None,
        ip_address=ip_address,
    )
    db.add(entry)
    db.flush()

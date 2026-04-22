import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.otp import OTPVerification
from app.core.config import settings


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def create_otp(db: Session, user_id: str) -> str:
    # Invalidate previous OTPs
    db.query(OTPVerification).filter(
        OTPVerification.user_id == user_id,
        OTPVerification.is_used == False,
        OTPVerification.status == 1,
    ).update({"is_used": True})
    db.flush()

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    otp = OTPVerification(user_id=user_id, code=code, expires_at=expires_at)
    db.add(otp)
    db.flush()
    return code


def verify_otp(db: Session, user_id: str, code: str) -> bool:
    now = datetime.now(timezone.utc)
    otp = db.query(OTPVerification).filter(
        OTPVerification.user_id == user_id,
        OTPVerification.code == code,
        OTPVerification.is_used == False,
        OTPVerification.expires_at > now,
        OTPVerification.status == 1,
    ).first()
    if not otp:
        return False
    otp.is_used = True
    db.flush()
    return True

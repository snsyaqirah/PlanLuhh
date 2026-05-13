from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.models.user import User, UserStatusEnum
from app.schemas.auth import (
    RegisterRequest, VerifyOTPRequest, SetPasswordRequest,
    LoginRequest, TokenResponse, ResendOTPRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.utils.otp import create_otp, verify_otp
from app.utils.email import send_otp_email, send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email, User.status == 1).first()
    if existing:
        if existing.is_verified:
            raise HTTPException(status_code=409, detail="Email already registered")
        # Re-send OTP for pending accounts
        code = create_otp(db, str(existing.id))
        db.commit()
        await send_otp_email(existing.email, existing.full_name or "there", code)
        return {"message": "Verification code resent"}

    user = User(email=payload.email, full_name=payload.full_name, preferred_currency=payload.preferred_currency)
    db.add(user)
    db.flush()
    code = create_otp(db, str(user.id))
    db.commit()
    await send_otp_email(user.email, user.full_name or "there", code)
    return {"message": "Registration successful. Check your email for the verification code."}


@router.post("/verify-otp")
def verify_otp_endpoint(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.status == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_otp(db, str(user.id), payload.code):
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    db.commit()
    return {"message": "OTP verified. Proceed to set your password."}


@router.post("/set-password")
def set_password(payload: SetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.status == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account already set up. Please login.")
    if user.password_hash:
        raise HTTPException(status_code=400, detail="Password already set. Please login.")
    user.password_hash = hash_password(payload.password)
    user.is_verified = True
    user.account_status = UserStatusEnum.VERIFIED
    db.commit()
    return {"message": "Password set. You can now sign in."}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.status == 1).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # HttpOnly cookies — XSS safe
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=settings.APP_ENV != "development",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=settings.APP_ENV != "development",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )
    return TokenResponse(access_token=access_token)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.post("/resend-otp")
async def resend_otp(payload: ResendOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.status == 1).first()
    if not user:
        # Return 200 always to prevent email enumeration
        return {"message": "If the email exists, a code has been sent."}
    code = create_otp(db, str(user.id))
    db.commit()
    await send_otp_email(user.email, user.full_name or "there", code)
    return {"message": "If the email exists, a code has been sent."}


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == payload.email, User.status == 1, User.is_verified == True
    ).first()
    if user:
        code = create_otp(db, str(user.id))
        db.commit()
        await send_password_reset_email(user.email, user.full_name or "there", code)
    return {"message": "If the email exists, a reset code has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email, User.status == 1).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
    if not verify_otp(db, str(user.id), payload.code):
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    user.password_hash = hash_password(payload.password)
    db.commit()
    return {"message": "Password reset successful. You can now sign in."}

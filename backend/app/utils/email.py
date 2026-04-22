from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings

mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

fastmail = FastMail(mail_config)


async def send_otp_email(email: str, full_name: str, otp_code: str) -> None:
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#1f2937;">PlanLuhh — Email Verification</h2>
      <p>Hi <strong>{full_name}</strong>,</p>
      <p>Your verification code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#4f46e5;text-align:center;padding:16px 0;">
        {otp_code}
      </div>
      <p style="color:#6b7280;font-size:13px;">This code expires in {settings.OTP_EXPIRE_MINUTES} minutes. Do not share it with anyone.</p>
    </div>
    """
    message = MessageSchema(
        subject="PlanLuhh — Your Verification Code",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await fastmail.send_message(message)


async def send_password_reset_email(email: str, full_name: str, otp_code: str) -> None:
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#1f2937;">PlanLuhh — Reset Password</h2>
      <p>Hi <strong>{full_name}</strong>,</p>
      <p>Your password reset code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#dc2626;text-align:center;padding:16px 0;">
        {otp_code}
      </div>
      <p style="color:#6b7280;font-size:13px;">Expires in {settings.OTP_EXPIRE_MINUTES} minutes. If you didn't request this, ignore this email.</p>
    </div>
    """
    message = MessageSchema(
        subject="PlanLuhh — Reset Your Password",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await fastmail.send_message(message)

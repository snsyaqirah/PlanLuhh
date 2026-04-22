from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "PlanLuhh"
    APP_ENV: str = "development"

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str

    # Email
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_FROM_NAME: str = "PlanLuhh"
    MAIL_PORT: int = 587
    MAIL_SERVER: str
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10

    # Encryption
    ENCRYPTION_KEY: str

    # OTP
    OTP_EXPIRE_MINUTES: int = 10

    @property
    def allowed_origins(self) -> List[str]:
        return [self.FRONTEND_URL]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "BSRP Gaming"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str

    # Frontend URL for reset password and verification links
    FRONTEND_URL: str = "https://bsrpgaming.com"  # Updated for production

    # Email settings for ranking form
    EMAIL_FROM: Optional[str] = None
    EMAIL_RECIPIENTS: Optional[str] = None

    # SMTP settings (used for both ranking form and auth emails)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True

    # Additional email settings for auth
    EMAIL_FROM_ADDRESS: str = "buildsbybrett@gmail.com"  # Updated for production
    EMAIL_FROM_NAME: str = "BSRP Gaming"

    @field_validator('EMAIL_RECIPIENTS')
    @classmethod
    def parse_email_recipients(cls, v: Optional[str]) -> List[str]:
        if not v:
            return []
        return [email.strip() for email in v.split(',') if email.strip()]

    # Use EMAIL_FROM if set, otherwise use EMAIL_FROM_ADDRESS
    @field_validator('EMAIL_FROM_ADDRESS')
    @classmethod
    def set_email_from(cls, v: str, values) -> str:
        return values.data.get('EMAIL_FROM') or v

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow"
    )

settings = Settings()
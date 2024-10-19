# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Warzone Tournament Hub"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str

    # Email settings
    EMAIL_FROM: Optional[str] = None
    EMAIL_RECIPIENTS: Optional[str] = None
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    @field_validator('EMAIL_RECIPIENTS')
    @classmethod
    def parse_email_recipients(cls, v: Optional[str]) -> List[str]:
        if not v:
            return []
        return [email.strip() for email in v.split(',') if email.strip()]

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
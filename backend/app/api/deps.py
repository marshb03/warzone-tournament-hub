# app/api/deps.py
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.config import settings
from app.core.security import verify_token
from app.db.database import SessionLocal
from app.models.user import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/login/access-token")

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        user_id = verify_token(token, "access")
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValidationError):
        raise credentials_exception
        
    user = crud.user.get_user(db, user_id=user_id)
    if not user:
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:  # Use the model property directly
        raise HTTPException(
            status_code=400,
            detail="Inactive user"
        )
    return current_user

def get_current_super_admin(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Super admin privileges required"
        )
    return current_user

def get_current_host_or_super_admin(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if current_user.role not in [UserRole.HOST, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Host privileges required"
        )
    return current_user
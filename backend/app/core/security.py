# app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional, Literal
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

TokenType = Literal["password_reset", "email_verification", "profile_update"]

def create_token(subject: Union[str, Any], token_type: TokenType, expires_delta: timedelta = None) -> str:
    """Generic token creation for both password reset and email verification"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # 24 hours for password reset, 72 hours for email verification
        hours = 24 if token_type == "password_reset" else 72
        expire = datetime.utcnow() + timedelta(hours=hours)
        
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": token_type
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str, token_type: TokenType) -> Optional[int]:
    """Generic token verification for both password reset and email verification"""
    try:
        decoded_jwt = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if decoded_jwt["type"] != token_type:
            return None
        return int(decoded_jwt["sub"])
    except JWTError:
        return None

# Specific token functions
def create_password_reset_token(user_id: int) -> str:
    return create_token(user_id, "password_reset")

def create_email_verification_token(user_id: int) -> str:
    return create_token(user_id, "email_verification")

def verify_password_reset_token(token: str) -> Optional[int]:
    return verify_token(token, "password_reset")

def verify_email_verification_token(token: str) -> Optional[int]:
    return verify_token(token, "email_verification")

# Existing password functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    print("Hash settings used for verification:")
    print(pwd_context.to_string())
    result = pwd_context.verify(plain_password, hashed_password)
    if not result:
        # Try hashing the plain password to compare formats
        test_hash = pwd_context.hash(plain_password)
        print(f"Test hash of plain password: {test_hash}")
    return result

def get_password_hash(password: str) -> str:
    print("Password hashing settings:")
    print(pwd_context.to_string())
    result = pwd_context.hash(password)
    print(f"Hashing result: {result}")
    return result

def create_profile_update_token(user_id: int) -> str:
    """Create token for profile updates with 15-minute expiration"""
    return create_token(
        user_id, 
        "profile_update", 
        expires_delta=timedelta(minutes=15)
    )

def verify_profile_update_token(token: str) -> Optional[int]:
    """Verify profile update token"""
    return verify_token(token, "profile_update")
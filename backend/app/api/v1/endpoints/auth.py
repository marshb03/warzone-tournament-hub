# app/api/v1/endpoints/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict
from pydantic import BaseModel
from app.models import User
from app.core.security import get_password_hash, verify_password_reset_token, verify_password

from app import crud, schemas, models
from app.api import deps
from app.crud import user
from app.core import security
from app.core.security import (
    create_password_reset_token,
    verify_password_reset_token,
    create_email_verification_token,
    verify_email_verification_token,
    create_token,
    create_profile_update_token,
    verify_profile_update_token
)
from app.core.email import send_password_reset_email, send_verification_email, send_email
from app.core.config import settings

router = APIRouter()

email_attempts = defaultdict(list)
MAX_ATTEMPTS = 3
RATE_LIMIT_DURATION = timedelta(hours=1)

def check_email_rate_limit(email: str):
    now = datetime.utcnow()
    # Remove old attempts
    email_attempts[email] = [
        attempt for attempt in email_attempts[email]
        if now - attempt < RATE_LIMIT_DURATION
    ]
    
    if len(email_attempts[email]) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail=f"Too many attempts. Please try again in {RATE_LIMIT_DURATION.seconds // 3600} hours."
        )
    
    email_attempts[email].append(now)

@router.post("/login/access-token", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = crud.user.authenticate_user(
        db, email_or_username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email/username or password")
    if not user.is_active:  # Use the user model property directly
        raise HTTPException(status_code=400, detail="Inactive user")
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="Please verify your email before logging in")
    
    # Expiration for the access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Generate token using the updated `create_token`
    access_token = create_token(
        subject=user.id,
        token_type="access",
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/test-token", response_model=schemas.User)
def test_token(current_user: schemas.User = Depends(deps.get_current_user)):
    """
    Test access token
    """
    return current_user

@router.post("/forgot-password")
async def forgot_password(
    email: str,
    db: Session = Depends(deps.get_db)
):
    """Password recovery endpoint"""
    print(f"Received password reset request for email: {email}")
    try:
        user = crud.user.get_user_by_email(db, email=email)
        if user:
            token = create_password_reset_token(user.id)
            # Add await here
            await send_password_reset_email(
                email_to=user.email,
                token=token,
                username=user.username
            )
            print(f"Reset email sent successfully to {email}")
    except Exception as e:
        print(f"Error sending reset email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "If the email exists, a password reset link has been sent"}

class PasswordReset(BaseModel):
    new_password: str

@router.post("/reset-password/{token}")
async def reset_password(token: str, password_data: PasswordReset, db: Session = Depends(deps.get_db)):
    user_id = verify_password_reset_token(token)
    
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = crud.user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hashed_password = get_password_hash(password_data.new_password)
    
    user_update = schemas.UserUpdate(password=password_data.new_password)
    updated_user = crud.user.update_user(db, user_id=user_id, user_update=user_update)
    
    return {"message": "Password updated successfully"}


@router.get("/verify-email/{token}")
async def verify_email(token: str, db: Session = Depends(deps.get_db)):
    try:
        
        user_id = verify_email_verification_token(token)
       
        if not user_id:
            print("Invalid or expired token")
            return {
                "success": False,
                "message": "Invalid or expired verification link. Please request a new one."
            }

        user = crud.user.get_user(db, user_id=user_id)
        
        if not user:
            return {
                "success": False,
                "message": "User no longer exists."
            }

        if user.is_verified:
            return {
                "success": True,
                "message": "Email already verified. You can now log in."
            }

        try:
            # Update user verification status
            user.is_verified = True
            db.commit()
            db.refresh(user)
            print(f"Verification status updated successfully. New status: {user.is_verified}")
            
            return {
                "success": True,
                "message": "Email verified successfully! You can now log in."
            }
            
        except Exception as update_error:
            print(f"Error updating user verification status: {str(update_error)}")
            db.rollback()
            raise update_error
        
    except Exception as e:
        print(f"Verification failed with error: {str(e)}")
        print("Full error details:")
        import traceback
        print(traceback.format_exc())
        return {
            "success": False,
            "message": "Verification failed. Please try again or contact support."
        }
        
@router.post("/register", response_model=schemas.User)
async def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(deps.get_db)
):
    try:
        
        check_email_rate_limit(user.email)
        
        # Check if user exists
        if crud.user.get_user_by_email(db, email=user.email):
            print(f"Email {user.email} already registered")
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Create user
        new_user = crud.user.create_user(db=db, user=user)
        
        try:
            # Generate verification token
            token = create_email_verification_token(new_user.id)
            
            # Send verification email
            await send_verification_email(
                email_to=new_user.email,
                token=token,
                username=new_user.username
            )
            
        except Exception as email_error:
            print(f"Error sending verification email: {str(email_error)}")
            print("Full error details:")
            import traceback
            print(traceback.format_exc())
            # Note: We're catching the email error but still returning the user
            # This way the account is created even if email fails
        
        return new_user
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        print("Full error details:")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Add this test route temporarily
@router.get("/test-email")
async def test_email():
    try:
        await send_email(
            email_to="brett.marshall81@gmail.com",
            subject="Test Email",
            html_content="<p>This is a test email from Warzone Tournament Hub</p>"
        )
        return {"message": "Test email sent successfully"}
    except Exception as e:
        print(f"Error details: {str(e)}")  # Add this for debugging
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/resend-verification")
async def resend_verification_email(
    email: str,
    db: Session = Depends(deps.get_db)
):
    check_email_rate_limit(email)
    
    user = crud.user.get_user_by_email(db, email=email)
    if not user:
        # Return success even if email doesn't exist (security best practice)
        return {"message": "If the email exists, a verification link has been sent"}
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    token = create_email_verification_token(user.id)
    await send_verification_email(
        email_to=user.email,
        token=token,
        username=user.username
    )
    
    return {"message": "Verification email sent"}

@router.get("/verification-status/{email}")
async def check_verification_status(
    email: str,
    db: Session = Depends(deps.get_db)
):
    user = crud.user.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"is_verified": user.is_verified}

@router.post("/request-profile-update")
async def request_profile_update(
    current_user: models.User = Depends(deps.get_current_user)
):
    token = create_profile_update_token(current_user.id)
    return {"token": token}

@router.put("/update-profile/{token}")
def update_profile(
    token: str,
    user_update: schemas.UserUpdate,
    db: Session = Depends(deps.get_db)
):
    user_id = verify_profile_update_token(token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    updated_user = crud.user.update_user(db=db, user_id=user_id, user_update=user_update)
    return updated_user

# Add this temporary test endpoint
@router.get("/test-reset-token/{user_id}")
async def get_test_reset_token(user_id: int):
    """Temporary endpoint for testing - remove in production"""
    token = create_password_reset_token(user_id)
    return {"token": token}
# app/crud/user.py
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from typing import Optional, List
from app.models.user import User, UserRole
from app.models.host_profile import HostProfile
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.host_profile import HostProfileCreate
from app.core.security import get_password_hash, verify_password

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    include_inactive: bool = False
) -> List[User]:
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if not include_inactive:
        query = query.filter(User.is_active == True)
    
    return query.offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=UserRole.USER  # Default role for new users
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    # Check if email already exists for another user
    if user_update.email:
        existing_user = get_user_by_email(db, user_update.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=400,
                detail="Email already registered to another user"
            )

    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    
    # Handle password update separately
    if 'password' in update_data:
        update_data['hashed_password'] = get_password_hash(update_data['password'])
        del update_data['password']
    if 'current_password' in update_data:
        del update_data['current_password']
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def create_host_profile_for_user(db: Session, user: User) -> HostProfile:
    """Create a default host profile for a user"""
    host_profile_data = HostProfileCreate(
        user_id=user.id,
        organization_name=user.username,  # Default to username
        description=None,
        banner_path=None
    )
    
    db_profile = HostProfile(**host_profile_data.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_user_role(
    db: Session,
    user_id: int,
    new_role: UserRole,
    super_admin_id: int
) -> Optional[User]:
    """Update user role with additional checks and auto-create host profile"""
    if user_id == super_admin_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot modify your own super admin status"
        )
    
    db_user = get_user(db, user_id)
    if not db_user:
        return None
        
    # Prevent having multiple super admins
    if new_role == UserRole.SUPER_ADMIN:
        existing_super_admin = db.query(User).filter(
            User.role == UserRole.SUPER_ADMIN
        ).first()
        if existing_super_admin:
            raise HTTPException(
                status_code=400,
                detail="A super admin already exists"
            )
    
    # Store old role to check if we need to create/remove host profile
    old_role = db_user.role
    
    # Update the role
    db_user.role = new_role
    db.commit()
    db.refresh(db_user)
    
    # Auto-create host profile if promoting to HOST
    if new_role == UserRole.HOST and old_role != UserRole.HOST:
        # Check if host profile already exists
        existing_profile = db.query(HostProfile).filter(
            HostProfile.user_id == user_id
        ).first()
        
        if not existing_profile:
            create_host_profile_for_user(db, db_user)
            print(f"Created host profile for user {db_user.username}")
    
    # Note: We don't delete host profiles when demoting from HOST
    # in case they get promoted again later
    
    return db_user

def toggle_user_active_status(
    db: Session,
    user_id: int,
    super_admin_id: int
) -> Optional[User]:
    """Toggle user's active status"""
    if user_id == super_admin_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot deactivate your own account"
        )
    
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    db_user.is_active = not db_user.is_active
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email_or_username: str, password: str) -> Optional[User]:
    user = db.query(User).filter(
        or_(
            User.email == email_or_username,
            User.username == email_or_username
        )
    ).first()
    
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    if not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="This account has been deactivated"
        )
    
    return user
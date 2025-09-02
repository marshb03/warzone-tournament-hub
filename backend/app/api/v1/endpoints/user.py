# app/api/v1/endpoints/user.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, models, schemas
from app.api import deps
from app.api.deps import get_current_user
from app.schemas.user import User, UserCreate
from app.models.user import UserRole
from app.core.cloudinary import cloudinary_service

from app.schemas.host_profile import LogoUpdate
from app.crud import host_profile as host_crud

router = APIRouter()

@router.post("/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    db_user = crud.user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.user.create_user(db=db, user=user)

@router.post("/users", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    db_user = crud.user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.user.create_user(db=db, user=user)

@router.get("/users", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    users = crud.user.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(deps.get_db)):
    db_user = crud.user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    db_user = crud.user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = crud.user.update_user(db=db, user_id=user_id, user_update=user_update)
    return updated_user

@router.delete("/{user_id}", response_model=schemas.User)
def delete_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    db_user = crud.user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    deleted_user = crud.user.delete_user(db=db, user_id=user_id)
    return deleted_user

@router.get("/hosts", response_model=List[schemas.User])
def get_all_hosts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Retrieve all hosts (Super Admin only).
    """
    return crud.user.get_users(db, skip=skip, limit=limit, role=UserRole.HOST)

@router.get("/", response_model=List[schemas.User])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    include_inactive: bool = False,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Retrieve all users with optional filtering (Super Admin only).
    """
    return crud.user.get_users(
        db, 
        skip=skip, 
        limit=limit, 
        role=role,
        include_inactive=include_inactive
    )

@router.put("/{user_id}/promote", response_model=schemas.User)
def promote_to_host(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Promote a regular user to Host status (Super Admin only).
    """
    # Get the user
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is already a host or super admin
    if user.role != UserRole.USER:
        raise HTTPException(
            status_code=400,
            detail=f"User is already a {user.role.value}"
        )
    
    return crud.user.update_user_role(
        db=db,
        user_id=user_id,
        new_role=UserRole.HOST,
        super_admin_id=current_user.id
    )

@router.put("/{user_id}/demote", response_model=schemas.User)
def demote_to_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Demote a Host back to regular user status (Super Admin only).
    """
    # Get the user
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is a host
    if user.role != UserRole.HOST:
        raise HTTPException(
            status_code=400,
            detail="User is not a Host"
        )
    
    return crud.user.update_user_role(
        db=db,
        user_id=user_id,
        new_role=UserRole.USER,
        super_admin_id=current_user.id
    )

@router.put("/{user_id}/toggle-active", response_model=schemas.User)
def toggle_user_active_status(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_super_admin)
):
    """
    Toggle a user's active status (Super Admin only).
    """
    # Get the user
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deactivating super admin
    if user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=400,
            detail="Cannot deactivate super admin account"
        )
    
    return crud.user.toggle_user_active_status(
        db=db,
        user_id=user_id,
        super_admin_id=current_user.id
    )
    
@router.get("/me", response_model=schemas.User)
def get_current_user_profile(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get current user profile with logo information
    """
    # Create user data dict manually to include logo fields
    user_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "logo_url": None,
        "logo_public_id": None,
        "organization_name": None
    }
    
    # Add logo info from host profile if exists
    if current_user.role in [UserRole.HOST, UserRole.SUPER_ADMIN]:
        host_profile = host_crud.get_host_profile(db, current_user.id)
        if host_profile:
            user_data["logo_url"] = host_profile.logo_url
            user_data["logo_public_id"] = host_profile.logo_public_id
            user_data["organization_name"] = host_profile.organization_name
    
    return user_data

@router.put("/me/logo")
async def update_user_logo(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Update current user's logo via file upload (Host and Super Admin only)
    """
    # Check if user is a host or super admin
    if current_user.role not in [UserRole.HOST, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only hosts can upload logos"
        )
    
    try:
        # Upload to Cloudinary
        upload_result = await cloudinary_service.upload_logo(file, current_user.id)
        
        # Create LogoUpdate object
        logo_data = LogoUpdate(
            logo_url=upload_result["logo_url"],
            logo_public_id=upload_result["logo_public_id"]
        )
        
        # Get existing profile to check if we need to delete old logo
        existing_profile = host_crud.get_host_profile(db, current_user.id)
        old_public_id = existing_profile.logo_public_id if existing_profile else None
        
        # Update or create host profile with logo
        updated_profile = host_crud.update_host_logo(db, current_user.id, logo_data)
        if not updated_profile:
            raise HTTPException(
                status_code=500,
                detail="Failed to update logo in database"
            )
        
        # Delete old logo from Cloudinary if it exists
        if old_public_id and old_public_id != upload_result["logo_public_id"]:
            cloudinary_service.delete_logo(old_public_id)
        
        # Return updated user data with logo info
        user_data = {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role,
            "is_active": current_user.is_active,
            "is_verified": current_user.is_verified,
            "logo_url": updated_profile.logo_url,
            "logo_public_id": updated_profile.logo_public_id,
            "organization_name": updated_profile.organization_name
        }
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Logo upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to upload logo"
        )

@router.delete("/me/logo", response_model=schemas.User)  
def remove_user_logo(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Remove current user's logo (Host and Super Admin only)
    """
    # Check if user is a host or super admin
    if current_user.role not in [UserRole.HOST, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only hosts can remove logos"
        )
    
    # Get current profile to get public_id for deletion
    existing_profile = host_crud.get_host_profile(db, current_user.id)
    if existing_profile and existing_profile.logo_public_id:
        # Delete from Cloudinary
        cloudinary_service.delete_logo(existing_profile.logo_public_id)
    
    # Remove logo from host profile
    updated_profile = host_crud.remove_host_logo(db, current_user.id)
    
    # Return updated user data without logo info
    user_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "logo_url": None,
        "logo_public_id": None,
        "organization_name": None
    }
    
    return user_data
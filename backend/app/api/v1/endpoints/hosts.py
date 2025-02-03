# app/api/v1/endpoints/hosts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from app.api import deps
from app.models.user import User, UserRole
from app.schemas.host_profile import (
    HostProfile,
    HostProfileCreate,
    HostProfileUpdate
)
from app.crud import host_profile as crud

router = APIRouter()

@router.get("/active", response_model=List[Dict])
async def get_active_hosts(
    db: Session = Depends(deps.get_db),
):
    """
    Get all active hosts who have hosted at least one tournament,
    including their statistics.
    """
    try:
        result = crud.get_active_hosts_with_stats(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=HostProfile)
async def create_host_profile(
    profile: HostProfileCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
):
    """
    Create a new host profile (Super Admin only).
    """
    # Check if user exists and is a host
    user = db.query(User).filter(User.id == profile.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != UserRole.HOST:
        raise HTTPException(status_code=400, detail="User is not a host")
    
    # Check if profile already exists
    existing_profile = crud.get_host_profile(db, profile.user_id)
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists for this host")
    
    return crud.create_host_profile(db, profile)

@router.put("/{user_id}", response_model=HostProfile)
async def update_host_profile(
    user_id: int,
    profile_update: HostProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
):
    """
    Update a host profile (Super Admin only).
    """
    updated_profile = crud.update_host_profile(db, user_id, profile_update)
    if not updated_profile:
        raise HTTPException(status_code=404, detail="Host profile not found")
    return updated_profile

@router.delete("/{user_id}", response_model=HostProfile)
async def delete_host_profile(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
):
    """
    Delete a host profile (Super Admin only).
    """
    profile = crud.delete_host_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Host profile not found")
    return profile

@router.get("/{user_id}", response_model=HostProfile)
async def get_host_profile(
    user_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Get a specific host profile by user ID.
    """
    profile = crud.get_host_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Host profile not found")
    return profile